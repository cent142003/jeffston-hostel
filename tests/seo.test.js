const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root=path.resolve(__dirname,'..');
const text=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const main=()=>text('index.html');
const campus=()=>['hostel-near-legon/index.html','hostel-near-upsa/index.html','student-hostel-adenta/index.html','hostel-near-academic-city/index.html'];
const script=()=>text('scripts.js');

test('all indexable pages use current academic year and verifiable Vercel canonical URL',()=>{
  for (const file of ['index.html', ...campus()]) {
    const source=text(file);
    assert.doesNotMatch(source,/2025\s*[\/-]\s*2026/);
    assert.match(source,/<title>[^<]*(Jeffston|Hostel)/i);
    assert.match(source,/<meta name="description" content="[^"]{75,200}"/);
    const suffix = file==='index.html' ? '' : file.replace(/index\.html$/,'');
    assert.ok(source.includes('https://jeffston-court-hostel.vercel.app/'+suffix), 'canonical missing: '+file);
    assert.match(source,/<h1\b/i);
  }
  assert.match(main(),/2026\/2027 Academic Year/);
});

test('search metadata does not advertise unverifiable room prices or sold-out stock',()=>{
  for(const f of ['index.html',...campus()]) {
    const h=text(f);
    assert.doesNotMatch(h,/(?:from|start(?:ing)? at)\s*(?:GHS|₵)\s*[\d,]{4,}/i);
    assert.doesNotMatch(h,/<meta[^>]*(?:GHS|₵)\s*[\d,]{4,}/i);
    const scripts=[...h.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)];
    assert.ok(scripts.length, 'JSON-LD required for '+f);
    for(const s of scripts){
      const schema=JSON.parse(s[1]);
      assert.doesNotMatch(JSON.stringify(schema),/"hasOfferCatalog"|"priceRange"|"availability":"https:\/\/schema.org\/(?:InStock|SoldOut)"|"price":"\d+"/);
    }
  }
});

test('the initial rendered booking options and room table never show outdated inventory',()=>{
  const h=main();
  const roomPicker=h.match(/<select id="roomType"[\s\S]*?<\/select>/)?.[0];
  const table=h.match(/<table class="rooms-table"[\s\S]*?<\/table>/)?.[0];
  assert.ok(roomPicker);
  assert.ok(table);
  assert.doesNotMatch(roomPicker,/\bA101\b|GHS\s*\d|occupied/i);
  assert.doesNotMatch(table,/\bA101\b|₵\s*\d|status-available/i);
  assert.match(roomPicker,/Live|live|Checking|checking/);
  assert.match(table,/Live|live|Checking|checking/);
});

test('the live room, booking and payment integration remains in place and fails closed',()=>{
  const h=main(), js=script();
  assert.match(h,/id="rooms"[^>]*data-rooms-api="https:\/\/script.google.com/);
  assert.match(h,/id="booking-form"/);
  assert.match(h,/id="paystack-trigger"/);
  assert.match(h,/js.paystack.co\/v1\/inline.js/);
  assert.match(js,/window.JCH_ROOM_FEED_READY\s*=\s*false/);
  assert.match(js,/syncRoomsFromSheet\(/);
  assert.match(js,/loadRoomsWithJsonp\(/);
  assert.match(js,/payButton\.disabled\s*=\s*true/);
  assert.match(js,/window.JCH_ROOM_PRICING\s*=\s*rooms\.reduce/);
  assert.doesNotMatch(js,/const fallbackPricing\s*=/);
});

test('robots and sitemap list every live campus guide and no broken custom-domain canonicals',()=>{
  const xml=text('sitemap.xml'),robots=text('robots.txt');
  const routes=['/','/hostel-near-legon/','/hostel-near-upsa/','/student-hostel-adenta/','/hostel-near-academic-city/'];
  for(const route of routes)assert.ok(xml.includes('<loc>https://jeffston-court-hostel.vercel.app'+route+'</loc>'),route);
  assert.match(robots,/Sitemap: https:\/\/jeffston-court-hostel.vercel.app\/sitemap.xml/);
  assert.doesNotMatch(xml,/jeffstoncourthostel\.com/);
});

test('new local pages have original, useful content and avoid claiming an Academic City shuttle exists',()=>{
  const adenta=text('student-hostel-adenta/index.html');
  const academic=text('hostel-near-academic-city/index.html');
  for(const h of [adenta,academic]){
    assert.match(h,/Adenta Court Complex/);
    assert.match(h,/https:\/\/maps.app.goo.gl\/hcb8EMkCtQ6vAygy8/);
    assert.match(h,/\.\.\/index\.html#rooms/);
    assert.match(h,/\.\.\/index\.html#booking/);
    assert.match(h,/2026\/2027/);
  }
  assert.match(academic,/not.*(?:confirm|guarantee|scheduled|promise)|confirm.*(?:transport|route)/i);
});
