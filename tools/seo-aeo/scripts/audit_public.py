"""Read-only fixed-target public website checks; no third-party dependencies."""
import json, urllib.request, urllib.parse
from html.parser import HTMLParser
from datetime import datetime, timezone
HOST='jeffston-court-hostel.vercel.app'
PATHS=['/','/hostel-near-legon/','/hostel-near-upsa/','/hostel-near-academic-city/','/student-hostel-adenta/','/robots.txt','/sitemap.xml']
class Redirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,url):
        u=urllib.parse.urlsplit(url)
        if u.scheme!='https' or u.hostname!=HOST: raise ValueError('External redirect refused')
        return super().redirect_request(req,fp,code,msg,headers,url)
class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.title='';self.in_title=False;self.h1=0;self.description='';self.canonical='';self.noindex=False;self.schema=0
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if tag=='title':self.in_title=True
        if tag=='h1':self.h1+=1
        if tag=='meta' and d.get('name','').lower()=='description':self.description=d.get('content','')
        if tag=='meta' and d.get('name','').lower()=='robots':self.noindex='noindex' in d.get('content','').lower()
        if tag=='link' and 'canonical' in d.get('rel','').split():self.canonical=d.get('href','')
        if tag=='script' and d.get('type')=='application/ld+json':self.schema+=1
    def handle_endtag(self,tag):
        if tag=='title':self.in_title=False
    def handle_data(self,data):
        if self.in_title:self.title+=data

def inspect(text):
    p=Page();p.feed(text);issues=[]
    for missing,label in [(not p.title.strip(),'missing title'),(not p.description,'missing description'),(not p.canonical,'missing canonical'),(p.h1!=1,'review H1 count'),(p.noindex,'noindex on intended search page')]:
        if missing:issues.append(label)
    if p.canonical and urllib.parse.urlsplit(p.canonical).hostname!=HOST:issues.append('canonical uses another host')
    return {'title':p.title,'description':p.description,'canonical':p.canonical,'h1':p.h1,'staticJsonLdBlocks':p.schema,'issues':issues}

def main():
    rows=[];opener=urllib.request.build_opener(Redirect())
    for path in PATHS:
        row={'path':path}
        try:
            with opener.open(urllib.request.Request('https://'+HOST+path,headers={'User-Agent':'JeffstonReadOnlyAudit/1.0'}),timeout=20) as r:
                raw=r.read(1000001)
                if len(raw)>1000000:raise ValueError('Response too large')
                text=raw.decode('utf-8');row.update(status=r.status,finalUrl=r.url)
                if path.endswith('/'):
                    row.update(inspect(text))
                elif path=='/sitemap.xml':
                    import xml.etree.ElementTree as ET
                    root=ET.fromstring(text);row['sitemapUrls']=len(root.findall('.//{*}loc'))
                else:row['robots']=text
        except Exception as e:row.update(error=str(e),issues=['fetch or parse failed'])
        rows.append(row)
    print(json.dumps({'checkedAt':datetime.now(timezone.utc).isoformat(),'scope':'Static public HTML only; not indexation or field speed proof','pages':rows},indent=2))
    return 1 if any(r.get('issues') for r in rows) else 0
if __name__=='__main__':raise SystemExit(main())
