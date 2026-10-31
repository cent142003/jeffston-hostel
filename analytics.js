/* Aggregate measurement only: no names, emails, payment references or URL parameters. */
(function(){
 'use strict';
 if(location.hostname!=='jeffston-court-hostel.vercel.app'||new URLSearchParams(location.search).has('analytics_test')||navigator.doNotTrack==='1')return;
 window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};
 window.va('beforeSend',function(event){var u=new URL(event.url);u.search='';u.hash='';return Object.assign({},event,{url:u.href});});
 var sent=new Set();
 window.jchTrack=function(name){
  if(['Enquiry started','Enquiry accepted','Booking started','Payment popup completed'].indexOf(name)<0||sent.has(name))return;
  sent.add(name);window.va('event',{name:name});
 };
 document.addEventListener('focusin',function(e){if(e.target.closest('#info-form'))window.jchTrack('Enquiry started');if(e.target.closest('#booking-form'))window.jchTrack('Booking started');});
 var script=document.createElement('script');script.defer=true;script.src='/_vercel/insights/script.js';document.head.appendChild(script);
})();
