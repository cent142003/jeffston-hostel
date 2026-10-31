import unittest
from audit_public import inspect,HOST,Redirect
class AuditTest(unittest.TestCase):
 def test_good(self):
  r=inspect('<title>Hostel</title><meta name="description" content="Rooms"><link rel="canonical" href="https://'+HOST+'/"><h1>Rooms</h1>');self.assertEqual(r['issues'],[])
 def test_missing(self):self.assertIn('missing canonical',inspect('<h1>x</h1>')['issues'])
 def test_blocked(self):self.assertIn('noindex on intended search page',inspect('<meta name="robots" content="noindex">')['issues'])
 def test_external(self):
  with self.assertRaises(ValueError):Redirect().redirect_request(None,None,302,'',{},'https://example.com/')
if __name__=='__main__':unittest.main()
