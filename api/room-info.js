'use strict';
const {createHmac}=require('node:crypto');
const {validateRequest}=require('../lib/room-info');
module.exports=async function(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false});}
  const origin=process.env.JCH_SITE_ORIGIN;
  if(!origin || req.headers.origin!==origin) return res.status(403).json({ok:false,message:'Open the form on our website.'});
  if(!(req.headers['content-type']||'').startsWith('application/json'))return res.status(415).json({ok:false,message:'JSON required.'});
  let b;
  try{
    if(JSON.stringify(req.body).length>2048)throw Error('Request too large.');
    b=validateRequest(req.body);
  }catch(e){return res.status(400).json({ok:false,message:e.message});}
  const url=process.env.JCH_INFO_SCRIPT_URL,secret=process.env.JCH_INFO_SIGNING_SECRET;
  // Disabled until the isolated Apps Script backend is configured and verified.
  if(process.env.JCH_INFO_ENABLED!=='true'||!secret||secret.length<32||!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url||''))return res.status(503).json({ok:false,message:'Email requests are not available yet. Please contact reception.'});
  const clientIp=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||'').split(',')[0].trim();
  if(!clientIp||clientIp.length>64)return res.status(503).json({ok:false,message:'Request verification is unavailable. Contact reception.'});
  const clientTag=createHmac('sha256',secret).update('client:'+new Date().toISOString().slice(0,10)+':'+clientIp).digest('hex');
  const payload=JSON.stringify({...b,clientTag,action:'request',timestamp:Date.now()});
  const signature=createHmac('sha256',secret).update(payload).digest('hex');
  try{
    const upstream=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({payload,signature}),redirect:'follow',signal:AbortSignal.timeout(20000)});
    if(!upstream.ok)throw Error('Upstream error');
    const result=await upstream.json();
    if(result.ok!==true)throw Error('Not accepted');
    return res.status(200).json({ok:true,message:'Your request has been received. Please check your inbox. If you chose future updates, confirm that choice using the link in the email.'});
  }catch(_){return res.status(503).json({ok:false,message:'We could not confirm your request. Please check your inbox before trying again, or contact reception.'});}
};
