import test from 'node:test';
import assert from 'node:assert/strict';
import migrate, {config} from '../netlify/edge-functions/sites-migration.js';
const old='https://jch-upload.netlify.app', dest='https://jeffston-court-hostel.cent142003.chatgpt.site';
test('old public page GET and HEAD preserve destination path and query',()=>{
 for(const path of ['/', '/hostel-near-upsa/', '/hostel-near-legon', '/student-hostel-adenta/', '/hostel-near-academic-city/', '/room-updates/']) {
  for(const method of ['GET','HEAD']) {
   const r=migrate(new Request(old+path+'?utm_source=google',{method}));
   assert.equal(r.status,301);assert.equal(r.headers.get('location'),dest+(path.endsWith('/')?path:path+'/')+'?utm_source=google');
  }
 }
 assert.equal(migrate(new Request(old+'/index.html')).headers.get('location'),dest+'/');
});
test('POST forms and backend/asset requests are not redirected or consumed',async()=>{
 const request=new Request(old+'/',{method:'POST',body:'form-name=contact&message=synthetic'});
 assert.equal(migrate(request),undefined);assert.equal(await request.text(),'form-name=contact&message=synthetic');
 for(const path of ['/api/rooms','/api/room-info','/Assets/images/logo.jpg','/.netlify/functions/backend','/unrelated']) assert.equal(migrate(new Request(old+path)),undefined);
 assert.deepEqual(config.method,['GET','HEAD']);assert(!config.path.includes('/*'));
});
