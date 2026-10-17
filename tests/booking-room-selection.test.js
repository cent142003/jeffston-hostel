'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const puppeteer=require('/Users/blizzalmighty/.npm/_npx/4b4c857f6efdfb61/node_modules/puppeteer');
const root=path.resolve(__dirname,'..');
const room=(code,price,beds,capacity=4,occupied=1)=>({
  room:code,code,type:'Standard',occupancy:occupied+'/'+capacity,occupied,capacity,
  availableBeds:beds,rentAmount:price,rent:'₵'+price.toLocaleString('en-US'),status:beds?'Available':'Full',
});
const state={mode:'online',a101Price:5500,a101Beds:3};
function rooms(){return [room('A101',state.a101Price,state.a101Beds),room('A102',6700,3),room('B201',7800,0,2,2)]}
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml'};
let server,browser,base;
test.before(async()=>{
 server=http.createServer((req,res)=>{
  if(req.url.startsWith('/api/rooms')){
   res.setHeader('Content-Type','application/json; charset=utf-8');
   res.setHeader('Cache-Control','no-store');
   res.statusCode=state.mode==='offline'?503:200;
   res.end(JSON.stringify(state.mode==='offline'?{ok:false,error:'upstream unavailable'}:{ok:true,updatedAt:new Date().toISOString(),rooms:rooms()}));
   return;
  }
  const filename=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/,''))||'index.html';
  const target=filename.endsWith('/')||filename===root?path.join(filename,'index.html'):filename;
  if(!target.startsWith(root)){res.writeHead(403).end();return;}
  fs.readFile(target,(err,b)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(target)]||'application/octet-stream');res.writeHead(200).end(b);});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 base='http://127.0.0.1:'+server.address().port;
 browser=await puppeteer.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']});
});
test.after(async()=>{await browser?.close();await new Promise(resolve=>server?.close(resolve));});
async function newPage(){
 const p=await browser.newPage();
 await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2});
 await p.setRequestInterception(true);
 p.on('request',req=>{if(/script.google.com\/macros|script.googleusercontent.com\/macros/.test(req.url()))req.abort();else req.continue()});
 await p.goto(base+'/',{waitUntil:'domcontentloaded',timeout:30000});
 return p;
}
async function snapshot(p){return p.evaluate(()=>{
 const s=document.querySelector('#roomType'),b=document.querySelector('#paystack-trigger');
 return {ready:window.JCH_ROOM_FEED_READY,selected:s?.value,disabled:s?.disabled,options:[...s.options].map(o=>({value:o.value,disabled:o.disabled})),amount:document.querySelector('#amountInKobo')?.value,payDisabled:b?.disabled,payText:b?.textContent,status:document.querySelector('#room-feed-status')?.textContent?.trim()};
});}
async function selectRoom(p,value='room-a101',duration='first-semester'){await p.evaluate(({value,duration})=>{
 const s=document.querySelector('#roomType'),d=document.querySelector('#duration');
 s.value=value;s.dispatchEvent(new Event('change',{bubbles:true}));
 d.value=duration;d.dispatchEvent(new Event('change',{bubbles:true}));
},{value,duration});}
test('A: refreshed live prices preserve selected room, recalculate amount and keep Paystack guarded',{timeout:45000},async()=>{
 state.mode='online';state.a101Price=5500;state.a101Beds=3;
 const p=await newPage();
 try{
  await p.waitForFunction(()=>window.JCH_ROOM_FEED_READY,{timeout:20000});
  await selectRoom(p);
  const before=await snapshot(p);
  assert.equal(before.selected,'room-a101');assert.equal(before.amount,'550000');
  state.a101Price=5600;
  await p.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  await p.waitForFunction(()=>document.querySelector('#amountInKobo')?.value==='560000',{timeout:17000});
  const after=await snapshot(p);
  assert.equal(after.selected,'room-a101','Refresh must not clear the student selection');
  assert.equal(after.amount,'560000','Must use latest live rent');
  assert.equal(after.disabled,false);
  assert.equal(after.payDisabled,false);
  assert.match(after.status,/Live room availability loaded/);
  const displayed=await p.$eval('#selected-room-summary',el=>({visible:!el.hidden,text:el.textContent}));
  assert.equal(displayed.visible,true);
  assert.match(displayed.text,/A101/);
  assert.match(displayed.text,/5,600/);
 }finally{await p.close()}
});
test('B: failed room load disables payment; subsequent recovery reenables room selector',{timeout:50000},async()=>{
 state.mode='offline';const p=await newPage();
 try{
  await p.waitForFunction(()=>document.querySelector('#roomType')?.disabled===true,{timeout:17000});
  let snap=await snapshot(p);assert.equal(snap.ready,false);assert.equal(snap.payDisabled,true);
  state.mode='online';state.a101Price=5500;
  await p.click('#retry-room-feed');
  await p.waitForFunction(()=>window.JCH_ROOM_FEED_READY,{timeout:17000});
  snap=await snapshot(p);
  assert.equal(snap.disabled,false,'Recovered feed must enable room select');
  assert.ok(snap.options.find(o=>o.value==='room-a101'&&!o.disabled));
  await selectRoom(p);
  snap=await snapshot(p);
  assert.equal(snap.amount,'550000');
 }finally{await p.close()}
});
test('C: sold-out room clears stale selection and disables payment while other rooms stay listed',{timeout:45000},async()=>{
 state.mode='online';state.a101Price=5500;state.a101Beds=3;
 const p=await newPage();
 try{
  await p.waitForFunction(()=>window.JCH_ROOM_FEED_READY,{timeout:17000});
  await selectRoom(p);
  assert.equal((await snapshot(p)).amount,'550000');
  state.a101Beds=0;
  await p.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  await p.waitForFunction(()=>document.querySelector('#roomType')?.querySelector('option[value="room-a101"]')?.disabled===true,{timeout:17000});
  const snap=await snapshot(p);
  assert.equal(snap.selected,'','A full room must not remain bookable');
  assert.equal(snap.amount,'0');
  assert.equal(snap.payDisabled,true);
  assert.equal(snap.options.find(o=>o.value==='room-a102').disabled,false);
 }finally{await p.close()}
});
test('D: serverless same-origin feed validates upstream payload and fails closed',{timeout:8000},async()=>{
 const handler=require('../api/rooms.js');
 const saved=global.fetch;
 const invoke=async()=>{
  const headers={};
  const res={statusCode:200,setHeader(k,v){headers[k]=v},status(code){this.statusCode=code;return this;},json(value){this.body=value;return this;}};
  await handler({method:'GET'},res);
  return {headers,status:res.statusCode,body:res.body};
 };
 try{
  global.fetch=async()=>({ok:true,json:async()=>({ok:true,rooms:[room('A101',5500,3)]})});
  let response=await invoke();
  assert.equal(response.status,200);
  assert.equal(response.body.rooms[0].rentAmount,5500);
  assert.match(response.headers['Cache-Control'],/no-store/);
  global.fetch=async()=>{throw Error('upstream offline')};
  response=await invoke();
  assert.equal(response.status,503);
  assert.deepEqual(response.body.rooms,[]);
 }finally{global.fetch=saved}
});

test('E: student can tap Book from the room table and see the chosen room',{timeout:35000},async()=>{
 state.mode='online';state.a101Price=5500;state.a101Beds=3;
 const p=await newPage();
 try {
  await p.waitForFunction(()=>window.JCH_ROOM_FEED_READY,{timeout:17000});
  await p.click('.room-select-btn');
  const snap=await snapshot(p);
  assert.equal(snap.selected,'room-a101');
  assert.equal(snap.disabled,false);
  assert.equal(snap.payDisabled,true,'Duration must be selected before payment is enabled');
  await p.select('#duration','second-semester');
  const after=await snapshot(p);
  assert.equal(after.amount,'550000');
  assert.match(after.payText,/5,500/);
  const feedback=await p.$eval('#selected-room-summary',x=>x.textContent);
  assert.match(feedback,/A101/);
  assert.match(feedback,/Second Semester/);
 } finally {await p.close()}
});

test('F: after an established selection, losing the feed clears old price text and blocks checkout',{timeout:35000},async()=>{
 state.mode='online';state.a101Price=5500;state.a101Beds=3;
 const p=await newPage();
 try{
  await p.waitForFunction(()=>window.JCH_ROOM_FEED_READY,{timeout:17000});
  await selectRoom(p);
  assert.equal((await snapshot(p)).amount,'550000');
  state.mode='offline';
  await p.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  await p.waitForFunction(()=>document.querySelector('#roomType')?.disabled===true,{timeout:17000});
  const snap=await snapshot(p);
  assert.equal(snap.ready,false);
  assert.equal(snap.payDisabled,true);
  assert.equal(snap.amount,'');
  assert.equal(snap.status.includes('Cannot load'),true);
  const stale=await p.$eval('#selected-room-summary',el=>({hidden:el.hidden,text:el.textContent}));
  assert.equal(stale.hidden,true);
  assert.equal(stale.text,'','stale amount must never remain visible during a feed outage');
 }finally{await p.close()}
});
