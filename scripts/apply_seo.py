#!/usr/bin/env python3
"""2026/27 source-grounded SEO edits to the hostel site. Never touch payment/booking code."""
from pathlib import Path
import json, re, html as htm

ROOT=Path(__file__).resolve().parent.parent
BASE="https://jeffston-court-hostel.vercel.app"
MAPS="https://maps.app.goo.gl/hcb8EMkCtQ6vAygy8?g_st=ic"
YEAR="2026/2027"

def replace_once(h,old,new,label):
    count=h.count(old)
    assert count==1, f"{label}: expected 1 occurrence, saw {count}"
    return h.replace(old,new)

def schema_patch(h,landing=None):
    pat=r'(<script type="application/ld\+json">\s*)(\{[\s\S]*?\})(\s*</script>)'
    m=re.search(pat,h)
    assert m,"JSON-LD section missing"
    j=json.loads(m.group(2))
    graph=j.get("@graph",[])
    for node in graph:
        typ=node.get("@type")
        if typ=="LodgingBusiness" or typ==["LodgingBusiness"]:
            node.pop("priceRange",None)
            node.pop("hasOfferCatalog",None)
            node["hasMap"]=MAPS
            node["inLanguage"]="en-GH"
        if typ=="VideoObject":
            node["name"]="Tour the furnished rooms and facilities at Jeffston Court Hostel"
            node["description"]="See student rooms, shared spaces and facilities at Jeffston Court Hostel, Adenta Court Complex, Accra. Confirm current 2026/2027 prices and availability on the live website."
        if typ=="FAQPage":
            for faq in node.get("mainEntity",[]):
                name=faq.get("name","")
                if any(x in name.lower() for x in ("room","available","2025/2026","how much")):
                    if "2025/2026" in name or "what rooms" in name.lower() or "how much" in name.lower():
                        faq["name"]="How do I check 2026/2027 hostel room prices and availability?"
                        faq["acceptedAnswer"]["text"]="The live room table on our homepage shows current prices, occupancy and spaces supplied by the hostel management system. If the feed is unavailable, contact us on WhatsApp before booking."
                if "available 2025/2026" in faq.get("acceptedAnswer",{}).get("text",""):
                    faq["acceptedAnswer"]["text"]="Check current room types, spaces and rates on our homepage using the live room availability table."
    if landing:
        graph.append({
          "@type":"BreadcrumbList",
          "@id":BASE+"/"+landing+"/#breadcrumb",
          "itemListElement":[
            {"@type":"ListItem","position":1,"name":"Jeffston Court Hostel","item":BASE+"/"},
            {"@type":"ListItem","position":2,"name":landing.replace("hostel-near-","Hostel near ").replace("-"," ").title(),"item":BASE+"/"+landing+"/"}
          ]
        })
    string=json.dumps(j,ensure_ascii=False,indent=2)
    return h[:m.start(2)]+string+h[m.end(2):]

p=ROOT/"index.html"
h=p.read_text()
h=h.replace('<html lang="en">','<html lang="en-GH">')
h=h.replace("2025/2026",YEAR)
h=replace_once(h,'<title>Jeffston Court Hostel - Student Living near Legon and UPSA</title>',
  '<title>Student Hostel in Adenta near Legon &amp; UPSA | Jeffston Court Hostel</title>',"homepage title")
h=re.sub(r'<meta name="description" content="[^"]*"\s*/>',
  '<meta name="description" content="Furnished student hostel in Adenta Court Complex for 2026/2027. Compare 2-, 3- and 4-person rooms, check live bed availability and verified rents, and enquire directly." />',h,count=1)
h=re.sub(r'<meta property="og:title" content="[^"]*"\s*/>',
  '<meta property="og:title" content="Jeffston Court Hostel | Adenta Student Accommodation 2026/2027" />',h,count=1)
h=re.sub(r'<meta property="og:description" content="[^"]*"\s*/>',
  '<meta property="og:description" content="Furnished student accommodation near Legon and UPSA with live room availability, study spaces, Wi-Fi, security and direct booking support." />',h,count=1)
h=h.replace('<meta name="robots" content="index, follow" />',
            '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />\n  <meta property="og:locale" content="en_GH" />\n  <meta property="og:site_name" content="Jeffston Court Hostel" />\n  <meta name="twitter:title" content="Jeffston Court Hostel | Student Accommodation 2026/2027" />\n  <meta name="twitter:description" content="Student rooms in Adenta Court Complex. Check live 2026/2027 room prices, occupancy and booking options." />\n  <meta name="twitter:image" content="'+BASE+'/Assets/images/jch-gallery/jeffston-court-hostel-four-bed-bunk-room.jpg" />\n  <link rel="sitemap" type="application/xml" href="/sitemap.xml" />')
h=h.replace('  <link rel="preload" href="Assets/images/jch-gallery/jeffston-court-hostel-four-bed-bunk-room.webp" as="image" type="image/webp" />\n','')
h=replace_once(h,'<p class="hero-subtitle">Now Accepting Bookings for the 2026/2027 Academic Year!</p>',
               '<p class="hero-subtitle">2026/2027 Academic Year: Student Accommodation Enquiries Open</p>',"hero year")
h=replace_once(h,'<p>Updated room availability with semester rates from ₵5,500 in Adenta</p>',
               '<p>Furnished rooms at Adenta Court Complex, with live prices and remaining spaces shown below.</p>',"hero rent")
h=h.replace('Current rooms from GHS 5,500 per semester','Check current room rents and bed counts live')
h=h.replace('aria-label="Jeffston Court Hostel 2026/2027 room availability and facilities video"',
            'aria-label="Video tour of Jeffston Court Hostel rooms and facilities"')
h=h.replace('Current room availability is listed by room code, occupancy, and semester rent for the 2026/2027 Academic Year.',
            'For the 2026/2027 Academic Year, prices and remaining beds are checked against the hostel management system.')
h=schema_patch(h)
# Render empty placeholders rather than claim unknown bed status / prices before hydration.
tbody=r'(<table class="rooms-table"[\s\S]*?<tbody>)[\s\S]*?(</tbody>)'
h,n=re.subn(tbody,r'\1\n        <tr><td colspan="6" role="status" aria-live="polite">Checking live room prices and bed availability…</td></tr>\n      \2',h,count=1)
assert n==1,"Rooms table skeleton missing"
select=r'(<select id="roomType"[^>]*>)[\s\S]*?(</select>)'
h,n=re.subn(select,r'\1\n        <option value="" disabled selected>Checking live room availability…</option>\n      \2',h,count=1)
assert n==1,"Booking room dropdown skeleton missing"
# Add genuinely useful navigation to new topical guides, not doorway keyword stuffing.
needle='          <a class="btn btn-secondary" href="hostel-near-upsa/">View UPSA page</a>\n        </article>\n      </div>'
addition='''          <a class="btn btn-secondary" href="hostel-near-upsa/">View UPSA page</a>
        </article>
        <article class="campus-card" data-aos="fade-up">
          <p class="campus-card-kicker">Adenta &amp; Fafraha</p>
          <h3><a href="student-hostel-adenta/">Student accommodation in Adenta</a></h3>
          <p>Explore room sizes, shared facilities, location, what to check before paying, and 2026/2027 live availability.</p>
          <ul class="campus-points"><li>Two-, three- and four-person furnished rooms</li><li>Security and shared study-friendly facilities</li><li>Inspection enquiries and Google Maps directions</li></ul>
          <a class="btn btn-secondary" href="student-hostel-adenta/">Explore the Adenta guide</a>
        </article>
        <article class="campus-card" data-aos="fade-up">
          <p class="campus-card-kicker">Academic City students</p>
          <h3><a href="hostel-near-academic-city/">Accommodation for Academic City students</a></h3>
          <p>Understand the location, private student housing options and how to check the route before committing.</p>
          <ul class="campus-points"><li>Ask us about rooms and move-in dates</li><li>Check campus travel independently</li><li>No unconfirmed shuttle promise</li></ul>
          <a class="btn btn-secondary" href="hostel-near-academic-city/">View Academic City guide</a>
        </article>
      </div>'''
h=replace_once(h,needle,addition,"main campus cards")
assert YEAR in h and '2025/2026' not in h
p.write_text(h)

# Remove unused static fallback, leaving fail-closed API rendering and Paystack intact.
p=ROOT/"scripts.js";js=p.read_text()
js,n=re.subn(r'  const fallbackPricing = \{[\s\S]*?\n  \};\n\n','',js,count=1)
assert n==1,"Static fallbackPricing not found"
assert 'window.JCH_ROOM_PRICING = rooms.reduce' in js
p.write_text(js)

for slug,campus,short,topic in [
    ("hostel-near-legon","University of Ghana Legon","Legon","University of Ghana"),
    ("hostel-near-upsa","UPSA Accra","UPSA","University of Professional Studies, Accra")
]:
    p=ROOT/slug/"index.html"
    h=p.read_text()
    h=h.replace('<html lang="en">','<html lang="en-GH">').replace("2025/2026",YEAR)
    title=f"Student Hostel for {short} 2026/2027 | Jeffston Court Hostel"
    h=re.sub(r'<title>.*?</title>','<title>'+htm.escape(title)+'</title>',h,count=1)
    desc=f"Furnished student accommodation in Adenta Court Complex for students travelling to {campus}. Check live 2026/2027 bed availability, room photos, verified rents and booking support."
    h=re.sub(r'<meta name="description" content="[^"]*"\s*/>',
             '<meta name="description" content="'+htm.escape(desc,quote=True)+'" />',h,count=1)
    h=re.sub(r'<meta property="og:description" content="[^"]*"\s*/>',
             '<meta property="og:description" content="Compare furnished rooms, facilities and live 2026/2027 prices at Jeffston Court Hostel in Adenta Court Complex." />',h,count=1)
    h=h.replace('<meta name="robots" content="index, follow" />',
      '<meta name="robots" content="index,follow,max-image-preview:large" />\n  <meta property="og:locale" content="en_GH" />\n  <meta property="og:site_name" content="Jeffston Court Hostel" />')
    h=schema_patch(h,slug)
    # Remove human- and crawler-visible stale fixed prices. All actual rents are sourced from live booking system.
    h=h.replace('Rooms from GHS 5,500','View live room rates')
    h=h.replace('Available 2026/2027 semester rooms currently start from GHS 5,500, with Standard, Standard Big, General, and Premium room options shown on the room overview.',
                'Standard, Standard Big, General and Premium room options can be compared on the live homepage. Please confirm availability and rent there before booking.')
    h=h.replace('The current 2026/2027 overview includes Standard, Standard Big, General, and Premium rooms, with available rooms from GHS 5,500 per semester.',
                'For 2026/2027, check the homepage for current Standard, Standard Big, General and Premium room options, live bed counts and confirmed rents.')
    h=h.replace('with available rooms from GHS 5,500 per semester','with live room rents and bed counts on the homepage')
    h=h.replace('Available 2026/2027 semester rooms currently start from GHS 5,500',
                'For 2026/2027, check the homepage for current room rates')
    h=h.replace('The current 2026/2027 room overview includes','The 2026/2027 room overview includes')
    h=h.replace('GHS 5,500 to GHS 8,000 per semester','the live rates shown on our homepage')
    h=h.replace('GHS 5,500 - GHS 8,000 per semester','current live prices and vacancy information')
    h=h.replace('Current rent range:', 'Room rent:')
    # Static highlight grid previously contradicted the management feed.
    listing=r'(<ul class="campus-room-list">)[\s\S]*?(</ul>)'
    h,n=re.subn(listing,r'\1\n              <li><strong>2-person rooms</strong><span>Check live rent</span></li>\n              <li><strong>3-person rooms</strong><span>Check live rent</span></li>\n              <li><strong>4-person rooms</strong><span>Check live rent</span></li>\n            \2',h,count=1)
    assert n==1, f"{slug}: room highlight grid missing"
    h=h.replace('Updated July 11, 2026 with current 2026/2027 room and rent information.',
                'Updated October 9, 2026. Room rates and availability may change; check the live homepage.')
    h=h.replace('clear 2026/2027 semester rates','the 2026/2027 live room feed')
    h=h.replace('Updated 2026/2027 room pricing by code, type, and occupancy.',
                'Current 2026/2027 room prices and occupancy from the live feed.')
    h=h.replace('The booking form is connected to the current 2026/2027 room list,',
                'The booking form is connected to the live 2026/2027 room feed,')
    # Remove SEO jargon and focus on useful area and transparency facts.
    h=re.sub(r'<li><strong>Primary search:</strong>.*?</li>',
             f'<li><strong>Campus:</strong> {htm.escape(topic)} — confirm the route and typical travel time before reserving.</li>',h)
    h=re.sub(r'<li><strong>Also relevant for:</strong>.*?</li>',
             '<li><strong>Where the hostel is:</strong> Adenta Court Complex, Greater Accra.</li>',h)
    h=re.sub(r'<p class="section-kicker">Search match</p>','<p class="section-kicker">Plan your stay</p>',h)
    h=re.sub(r'from GHS\s*[0-9,]+', 'with up-to-date prices on our homepage', h, flags=re.I)
    h=re.sub(r'GHS\s*[0-9,]+', 'current confirmed prices',h,flags=re.I)
    assert not re.search(r'GHS\s*[0-9]',h)
    p.write_text(h)

def new_guide(slug,title,desc,hero,intro,sections,faqs,links):
    path=ROOT/slug/"index.html";path.parent.mkdir(parents=True,exist_ok=True)
    canon=BASE+"/"+slug+"/"
    desc=htm.escape(desc,quote=True)
    faq_schema=[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in faqs]
    graph={"@context":"https://schema.org","@graph":[
      {"@type":"WebPage","@id":canon+"#webpage","url":canon,"name":title,"description":htm.unescape(desc),"inLanguage":"en-GH","about":{"@id":BASE+"/#lodging"}},
      {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Jeffston Court Hostel","item":BASE+"/"},{"@type":"ListItem","position":2,"name":title,"item":canon}]},
      {"@type":"FAQPage","mainEntity":faq_schema}
    ]}
    section_html="\n".join(f'<section class="campus-page-section"><div class="campus-page-inner"><div class="campus-page-copy"><h2>{htm.escape(h)}</h2><p>{htm.escape(p)}</p></div></div></section>' for h,p in sections)
    faq_html="\n".join(f'<details><summary>{htm.escape(q)}</summary><p>{htm.escape(a)}</p></details>' for q,a in faqs)
    links_html=" ".join(f'<a class="btn btn-secondary" href="../{r}">{t}</a>' for r,t in links)
    content=f'''<!DOCTYPE html>
<html lang="en-GH">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{htm.escape(title)} | Jeffston Court Hostel</title>
<meta name="description" content="{desc}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="{canon}">
<meta property="og:type" content="article">
<meta property="og:locale" content="en_GH">
<meta property="og:site_name" content="Jeffston Court Hostel">
<meta property="og:title" content="{htm.escape(title,quote=True)}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{BASE}/Assets/images/jch-gallery/jeffston-court-hostel-adenta-exterior.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="../style.css">
<script type="application/ld+json">{json.dumps(graph,ensure_ascii=False,indent=2)}</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>
<header class="navbar" role="banner"><div class="navbar-inner"><a href="../index.html" class="logo"><img src="../Assets/images/logo2.jpg" alt="Jeffston Court Hostel" width="40" height="40"><span class="logo-text">JCH</span></a><nav class="nav-links" aria-label="Site navigation"><ul><li><a href="../index.html">Home</a></li><li><a href="../index.html#rooms">Live rooms</a></li><li><a href="../index.html#booking">Booking</a></li><li><a href="../index.html#contact">Contact</a></li></ul></nav></div></header>
<main id="main">
<section class="campus-landing-hero" aria-labelledby="guide-heading"><div class="campus-landing-content"><p class="section-kicker">Jeffston Court Hostel · 2026/2027</p><h1 id="guide-heading">{htm.escape(hero)}</h1><p>{htm.escape(intro)}</p><div class="campus-landing-actions"><a class="btn btn-primary" href="../index.html#rooms">Check live 2026/2027 rooms</a><a class="btn btn-whatsapp" href="https://wa.me/233201349321?text=Hello%2C%20I%20would%20like%20to%20ask%20about%20a%202026%2F2027%20room%20at%20Jeffston%20Court%20Hostel." target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a></div></div></section>
<div class="campus-quick-strip"><div class="campus-quick-strip-inner"><span>Adenta Court Complex</span><span>Furnished shared rooms</span><span>Real-time room availability</span><span>Secure student accommodation</span></div></div>
{section_html}
<section class="campus-page-section"><div class="campus-page-inner"><div class="campus-page-copy"><h2>Before you reserve</h2><p>Check the room occupancy and exact rent in the <a href="../index.html#rooms">live availability table</a>. Prices and remaining bed spaces can change as students make bookings. If the live data is unavailable, contact management and confirm the rate before paying. You may also ask for the current room photographs, tenancy terms and an inspection time.</p><p><a href="{MAPS}" target="_blank" rel="noopener noreferrer">See Jeffston Court Hostel on Google Maps</a> for directions to Adenta Court Complex. Allow for traffic and verify your preferred campus commute before committing.</p><p>{links_html}</p></div></div></section>
<section class="campus-faq-section" aria-labelledby="guide-faq"><div class="section-intro"><h2 id="guide-faq">Frequently asked questions</h2></div><div class="faq-list">{faq_html}</div></section>
</main>
<div class="mobile-booking-bar"><a href="../index.html#booking" class="mobile-booking-primary">Book a Room</a><a href="https://wa.me/233201349321" target="_blank" rel="noopener noreferrer" class="mobile-booking-secondary">WhatsApp</a></div>
</body></html>
'''
    path.write_text(content)

new_guide(
 "student-hostel-adenta",
 "Student Hostel in Adenta for 2026/2027",
 "Compare furnished student accommodation in Adenta Court Complex, Fafraha, Accra for 2026/2027. See real room photos, facilities, Google Maps location and live rates.",
 "Student Hostel in Adenta Court Complex",
 "Jeffston Court Hostel is based in Adenta Court Complex in the Fafraha area. It is private student accommodation, not a hall operated by a university. You can check room types and current space before you choose your campus travel plan.",
 [
  ("Compare rooms on the information that actually matters","The hostel has shared furnished room options with two, three or four occupants depending on the unit. Use the live room table to compare exact occupancy, remaining beds and semester rent. When someone books, the management system updates the spaces displayed online. Check whether you prefer a quieter room, fewer roommates or a lower shared-room cost before selecting."),
  ("Facilities and daily living","The property describes study desks and furnished bedrooms, Wi-Fi, shared kitchen, laundry and lounge facilities, plus security and power support. Some rooms have air conditioning or water-heater features, so compare the particular room rather than assume every facility applies to all rooms. Ask the team about house rules and what is included before paying."),
  ("Make the commute part of your decision","Students travelling toward Legon or UPSA should check the practical travel route from Adenta Court Complex at the times their classes start. JET is a shared, scheduled service on confirmed routes; it is not a guaranteed individual taxi ride. Ask management about the current route plan and any campus not already in the timetable."),
  ("Inspect and confirm before payment","Parents and students can ask for a room video, the price currently returned by the hostel management system and an inspection appointment. Booking is only offered for rooms with live available spaces. If a chosen room is full, ask to join the waitlist instead of assuming the website can reserve a full room.")
 ],
 [
  ("Where is Jeffston Court Hostel located?","It is in Adenta Court Complex, Fafraha, Greater Accra. Use the Google Maps link on this page for directions."),
  ("How do I check the actual 2026/2027 room price?","Open the live room availability section on the homepage. It provides current occupancy, spaces and rent when the hostel management feed is available."),
  ("Are all rooms air-conditioned?","Room facilities vary. Check the exact room description and confirm air conditioning or water-heater features with management."),
  ("Is transport included to every university?","No route to every university is guaranteed. Confirm the current shared JET timetable and your campus route before booking.")
 ],
 [("hostel-near-legon/","Legon room guide"),("hostel-near-upsa/","UPSA room guide")]
)
new_guide(
 "hostel-near-academic-city",
 "Student Accommodation for Academic City University Students 2026/2027",
 "Academic City University students comparing off-campus accommodation can review furnished shared rooms at Jeffston Court Hostel, Adenta, and check verified rents and campus travel.",
 "Accommodation Options for Academic City University Students",
 "If you study at Academic City University and are comparing private accommodation, Jeffston Court Hostel in Adenta Court Complex is one option to review. The university is in the Agbogba/Haatso area; check the exact journey and class timetable before choosing the hostel.",
 [
  ("What an Academic City student should compare","Start with your academic schedule, typical campus journeys and your housing budget. Jeffston provides furnished shared student rooms, a lounge, shared kitchen and laundry facilities, with Wi-Fi and security support. The exact room facilities depend on the unit, so confirm whether the selected room has air conditioning and how many people share it."),
  ("Confirm the campus commute separately","Do not assume that a shuttle is currently assigned to Academic City. JET runs are scheduled around existing student routes and protected vehicle commitments. An Academic City journey, pickup point, fare and return arrangements must be agreed with the hostel before being relied on; check alternative transport and likely traffic at your lecture times."),
  ("Room availability is live, not a fixed advertisement","Check the current 2026/2027 inventory on the homepage. The live table updates the number of available beds and rent from the management system. If the source is temporarily unavailable, online payment is disabled to avoid quoting stale prices. Ask staff to reconfirm a place before arranging payment."),
  ("For university admissions and accommodation teams","An admissions officer or university welfare team can contact Jeffston Court Hostel to discuss a group inspection, availability for an intake, room occupancy options and transport feasibility. Group arrangements depend on confirmed student numbers, dates and operating capacity, rather than an automatic promise of beds or shuttle service.")
 ],
 [
  ("Is Jeffston Court Hostel an Academic City University hall?","No. It is private student accommodation in Adenta Court Complex, not accommodation owned by Academic City University."),
  ("Does JET currently run a confirmed Academic City shuttle?","A dedicated Academic City route is not confirmed on this page. Contact management for the current schedule and any proposed route or fare."),
  ("Can students check live room availability before applying?","Yes. When the hostel management system is available, the homepage displays live room availability and prices. Contact the hostel if a room is full or the live feed is unavailable.")
 ],
 [("student-hostel-adenta/","Adenta student accommodation guide"),("hostel-near-legon/","Legon room guide")]
)
# Add only changed URLs; preserve original image-specific sitemap entries.
p=ROOT/"sitemap.xml";xml=p.read_text().replace("2026-07-11","2026-10-09")
extra=''.join(f'  <url><loc>{BASE}/{slug}/</loc><lastmod>2026-10-09</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n' for slug in ("student-hostel-adenta","hostel-near-academic-city"))
assert xml.count("</urlset>")==1
p.write_text(xml.replace("</urlset>",extra+"</urlset>"))
print("Patched hostel homepage, scripts, 2 campus pages, 2 new local guides and sitemap.")
