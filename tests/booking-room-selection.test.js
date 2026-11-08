'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const {once}=require('node:events');
const fs=require('node:fs');
const path=require('node:path');
const puppeteer=require('puppeteer-core');
const root=path.resolve(__dirname,'..');
const room=(code,price,beds,capacity=4,occupied=1)=>({
  room:code,code,type:'Standard',occupancy:occupied+'/'+capacity,occupied,capacity,
  availableBeds:beds,rentAmount:price,rent:'₵'+price.toLocaleString('en-US'),status:beds?'Available':'Full',
});
const state={mode:'online',a101Price:5500,a101Beds:3};
const profileLanding='/?utm_source=google&utm_medium=organic&utm_campaign=business_profile&analytics_test=1#rooms';
function rooms(){return [room('A101',state.a101Price,state.a101Beds),room('A102',6700,3),room('B201',7800,0,2,2)]}
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml'};
let server,browser,base;
// A named suite runs its teardown as soon as its children finish; open Chrome
// and loopback sockets must not keep the root runner waiting for beforeExit.
test.describe('Offline mobile booking and reception',()=>{
test.before(async()=>{
 server=http.createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/api/rooms'){
   res.setHeader('Content-Type','application/json; charset=utf-8');
   res.setHeader('Cache-Control','no-store');
   res.statusCode=state.mode==='offline'?503:200;
   res.end(JSON.stringify(state.mode==='offline'?{ok:false,error:'upstream unavailable'}:{ok:true,updatedAt:new Date().toISOString(),rooms:rooms()}));
   return;
  }
  const target=path.resolve(root,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));
  const relative=path.relative(root,target);
  if(relative.split(path.sep).some(part=>part.startsWith('.')||part==='node_modules')||path.isAbsolute(relative)){
   res.writeHead(403).end();return;
  }
  fs.readFile(target,(err,b)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(target)]||'application/octet-stream');res.writeHead(200).end(b);});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 base='http://127.0.0.1:'+server.address().port;
 const chrome=process.env.PUPPETEER_EXECUTABLE_PATH?{executablePath:process.env.PUPPETEER_EXECUTABLE_PATH}:{channel:'chrome'};
 browser=await puppeteer.launch({...chrome,headless:true,args:['--disable-background-networking','--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1']});
});
test.after(async()=>{
 const stopServer=server?.listening?new Promise((resolve,reject)=>{
  server.close(error=>error?reject(error):resolve());
  // Chrome can leave speculative/preconnected loopback sockets without a request.
  server.closeAllConnections();
 }):Promise.resolve();
 const child=browser?.process();
 const running=()=>child && child.exitCode===null && child.signalCode===null;
 const closed=running()?once(child,'close'):Promise.resolve();
 // Some Windows Chrome processes acknowledge Browser.close but never exit.
 // This handle belongs only to this suite's isolated headless browser.
 const grace=setTimeout(()=>{if(running())child.kill('SIGKILL');},5000);
 grace.unref();
 try{await Promise.all([stopServer,browser?.close(),closed]);}
 finally{clearTimeout(grace);}
});
async function newPage(landing='/?analytics_test=1'){
 const p=await browser.newPage();
 await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2});
 await p.setBypassServiceWorker(true);
 await p.setRequestInterception(true);
 p.on('request',req=>{
  const safe=new URL(req.url()).origin===base && ['GET','HEAD'].includes(req.method());
  return safe?req.continue():req.abort('blockedbyclient');
 });
 await p.goto(base+landing,{waitUntil:'domcontentloaded',timeout:30000});
 return p;
}
// A destination in the markup isn't useful if it's hidden or covered by a mobile toolbar.
async function reachable(p,selector){
 const el=await p.waitForSelector(selector,{visible:true,timeout:6000});
 await el.evaluate(e=>e.scrollIntoView({block:'center',inline:'center',behavior:'instant'}));
 await p.waitForFunction(e=>{
  const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
  return e.checkVisibility({opacityProperty:true,visibilityProperty:true}) && e.contains(document.elementFromPoint(x,y));
 },{timeout:6000},el);
 return el;
}
async function checkReception(p){
 // Touch only same-page controls. Inspect the destinations; never launch a call or send a message.
 await (await reachable(p,'#mobile-menu')).tap();
 const contact=await reachable(p,'#primary-navigation a[href="#contact"]');
 await contact.tap();
 await p.waitForFunction(()=>location.hash==='#contact',{timeout:6000});
 const phone=await reachable(p,'#contact a[href^="tel:"]');
 assert.equal(await phone.evaluate(a=>a.href),'tel:+233201349321');
 const chat=await reachable(p,'#contact a[href^="https://wa.me/"]');
 const wa=new URL(await chat.evaluate(a=>a.href));
 assert.equal(wa.origin+wa.pathname,'https://wa.me/233201349321');
}
async function checkRoomsLanding(p){
 assert.equal(new URL(p.url()).hash,'#rooms');
 await p.waitForFunction(()=>{
  const r=document.querySelector('#rooms')?.getBoundingClientRect();
  return r && r.top<innerHeight && r.bottom>0;
 },{timeout:6000});
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
test('B: a profile visitor can reach reception during an outage and retry when prices recover',{timeout:50000},async()=>{
 state.mode='offline';const p=await newPage(profileLanding);
 try{
  await checkRoomsLanding(p);
  await p.waitForFunction(()=>window.JCH_ROOM_FEED_READY===false && document.querySelector('#retry-room-feed')?.hidden===false,{timeout:17000});
  let snap=await snapshot(p);assert.equal(snap.ready,false);assert.equal(snap.payDisabled,true);
  assert.equal(snap.disabled,true);
  const status=await reachable(p,'#room-feed-status');
  assert.match(await status.evaluate(e=>e.innerText),/retry|contact|WhatsApp|call/i);
  await checkReception(p);
  state.mode='online';state.a101Price=5500;
  await (await reachable(p,'#retry-room-feed')).tap();
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

test('E: a mobile Google profile visitor can compare a room and reach reception without a booking',{timeout:35000},async()=>{
 state.mode='online';state.a101Price=5500;state.a101Beds=3;
 const p=await newPage(profileLanding);
 try {
  await checkRoomsLanding(p);
  await p.waitForFunction(()=>window.JCH_ROOM_FEED_READY,{timeout:17000});
  const button='#rooms .room-select-btn[data-room-value="room-a101"]';
  const row='#rooms tr:has(.room-select-btn[data-room-value="room-a101"])';
  const code=await reachable(p,row+' th[scope="row"]');
  assert.equal(await code.evaluate(e=>e.innerText.trim()),'A101');
  const price=await reachable(p,row+' td:nth-of-type(3)');
  // formatCedi shortens the locale's GH₵ to ₵ (or preserves its ISO code).
  assert.match(await price.evaluate(e=>e.innerText.replace(/\s+/g,'')),/^(?:₵|GHS)5,500$/u);
  const availability=await reachable(p,row+' .status-available');
  assert.equal(await availability.evaluate(e=>e.innerText.trim().toLowerCase().replace(/\s+/g,' ')),'3 beds available');
  await checkReception(p);
  await (await reachable(p,button)).tap();
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
});
