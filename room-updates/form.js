'use strict';
const form=document.getElementById('info-form'),button=document.getElementById('jch-info-submit'),status=document.getElementById('jch-info-status');
let requestId=crypto.randomUUID(),lastData='';
form.addEventListener('submit',async event=>{
  event.preventDefault(); if(button.disabled||!form.reportValidity())return;
  const data={email:document.getElementById('jch-info-email').value.trim(),marketing:document.getElementById('jch-info-marketing').checked,company:form.elements.namedItem('company').value};
  const key=JSON.stringify(data); if(lastData&&lastData!==key)requestId=crypto.randomUUID();lastData=key;
  button.disabled=true;status.textContent='Sending your request…';
  try{
    const response=await fetch('/api/room-info',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,requestId})});
    const result=await response.json();
    status.textContent=result.message||'Please contact reception for help.';
    if(response.ok&&result.ok){button.textContent='Request received';return;}
  }catch(_){status.textContent='We could not confirm your request. Check your inbox before retrying, or contact reception.';}
  button.disabled=false;
});
