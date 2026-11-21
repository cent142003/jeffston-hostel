'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('no public page still exposes a live payment checkout or forgotten payment test',()=>{
 const pages=[
   'index.html','index_backup.html','test-payment.html',
   'hostel-near-legon/index.html','hostel-near-upsa/index.html',
   'student-hostel-adenta/index.html','hostel-near-academic-city/index.html'
 ];
 for(const file of pages){
   const html=read(file);
   assert.doesNotMatch(html,/js\.paystack\.co|PaystackPop|pk_live_|Proceed to Payment|paystack-trigger|bank transfer to|send deposit to/i,file);
 }
 assert.doesNotMatch(read('scripts.js'),/PaystackPop|pk_live_|paystack-trigger|\.openIframe\(/);
 assert.match(read('test-payment.html'),/Online payment test retired/);
 assert.match(read('index_backup.html'),/Old booking page retired/);
});

test('all indexable pages clearly state viewing first and payment on property only',()=>{
 const pages=[
   'index.html','hostel-near-legon/index.html','hostel-near-upsa/index.html',
   'student-hostel-adenta/index.html','hostel-near-academic-city/index.html'
 ];
 for(const file of pages){
   const html=read(file);
   assert.match(html,/payment-safety-notice/i,file);
   assert.match(html,/protect our guests and uphold the integrity of Jeffston Court Hostel/i,file);
   assert.match(html,/no payment should be made before|do not request or accept room payments before an in-person viewing/i,file);
   assert.match(html,/view\s*(?:the\s+room)?\s*(?:first|before)/i,file);
   assert.match(html,/pay(?:ments?)? (?:at|in) the (?:property|hostel)/i,file);
 }
 const h=read('index.html');
 assert.doesNotMatch(h,/Book online or ask questions on WhatsApp/);
 assert.doesNotMatch(h,/ReserveAction/);
 assert.match(h,/id="viewing-trigger"/);
 assert.doesNotMatch(h,/name="paystackKey"/);
 assert.doesNotMatch(h,/name="fullName"|name="phone"[^>]*required/);
});

test('original Google room price feed and public reception contact remain unchanged',()=>{
 const h=read('index.html');
 const api=read('api/rooms.js');
 assert.match(h,/data-rooms-api="\/api\/rooms"/);
 assert.match(h,/data-rooms-fallback-api="https:\/\/script.google.com\/macros\/s\//);
 assert.match(api,/exec\?action=rooms/);
 assert.match(api,/req\.method !== 'GET'/);
 assert.match(h,/https:\/\/wa\.me\/233201349321/);
 assert.match(read('scripts.js'),/https:\/\/wa\.me\/233201349321/);
});

test('the viewing assistant cannot be confused with online checkout',()=>{
 const code=read('scripts.js');
 assert.match(code,/viewingBtn\?\.addEventListener\('click'/);
 assert.match(code,/window\.JCH_ROOM_FEED_READY/);
 assert.match(code,/calculateAmount\(roomTypeInput\.value, durationInput\.value\) <= 0/);
 assert.match(code,/payments are made at the hostel after viewing the room, not online/);
 assert.doesNotMatch(code,/Payment Successful!|Payment popup completed|openIframe|PaystackPop/);
 const events=read('analytics.js');
 assert.match(events,/Viewing enquiry opened/);
 assert.doesNotMatch(events,/Payment popup completed/);
});
