#!/usr/bin/env python3
"""
Enhanced Debug Server for Jeffston Court Hostel Website
Provides detailed logging to diagnose CSS and resource loading issues
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path
import time

# Configuration
PORT = 8000
HOST = 'localhost'

class DebugHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Enhanced handler with detailed logging and debugging"""
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        # Disable caching for debugging
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def guess_type(self, path):
        """Enhanced MIME type detection"""
        mimetype, encoding = super().guess_type(path)
        
        if path.lower().endswith('.webp'):
            return 'image/webp', encoding
        elif path.lower().endswith('.jpg') or path.lower().endswith('.jpeg'):
            return 'image/jpeg', encoding
        elif path.lower().endswith('.png'):
            return 'image/png', encoding
        elif path.lower().endswith('.css'):
            return 'text/css', encoding
        elif path.lower().endswith('.js'):
            return 'application/javascript', encoding
        
        return mimetype, encoding
    
    def log_message(self, format, *args):
        """Enhanced logging with timestamps and file details"""
        timestamp = time.strftime("%H:%M:%S")
        message = format % args
        
        # Color coding for different request types
        if 'style.css' in message:
            print(f"[{timestamp}] 🎨 CSS: {message}")
        elif any(ext in message for ext in ['.jpg', '.jpeg', '.png', '.webp']):
            print(f"[{timestamp}] 🖼️  IMG: {message}")
        elif '.js' in message:
            print(f"[{timestamp}] ⚡ JS:  {message}")
        elif 'index.html' in message or message.endswith('/ '):
            print(f"[{timestamp}] 📄 HTML: {message}")
        else:
            print(f"[{timestamp}] 📁 REQ: {message}")
    
    def do_GET(self):
        """Enhanced GET handler with file existence checking"""
        requested_path = self.path.lstrip('/')
        if requested_path == '':
            requested_path = 'index.html'
        
        file_path = Path(requested_path)
        
        # Log detailed information about the request
        print(f"\n🔍 REQUEST DETAILS:")
        print(f"   Requested: {self.path}")
        print(f"   File path: {file_path}")
        print(f"   Exists: {file_path.exists()}")
        
        if file_path.exists():
            file_size = file_path.stat().st_size
            print(f"   Size: {file_size} bytes")
            
            if str(file_path).endswith('.css'):
                print(f"   📝 CSS file found - should load styling")
            elif any(str(file_path).endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                print(f"   🖼️  Image file found")
        else:
            print(f"   ❌ FILE NOT FOUND!")
            
            # Suggest alternatives for missing files
            if 'NEW4' in str(file_path):
                print(f"   💡 Suggestion: Maybe you meant 'bedroom4.jpg'?")
            
            # Look for similar files
            parent_dir = file_path.parent
            if parent_dir.exists():
                similar_files = list(parent_dir.glob(f"*{file_path.stem}*"))
                if similar_files:
                    print(f"   📁 Similar files found: {[f.name for f in similar_files]}")
        
        print(f"─" * 50)
        
        # Call the parent GET handler
        super().do_GET()

def check_critical_files():
    """Check for all critical files and report status"""
    critical_files = {
        'HTML': ['index.html'],
        'CSS': ['style.css'],
        'JavaScript': ['scripts.js'],
        'Images': [
            'Assets/images/optimized/HERO.jpg',
            'Assets/images/optimized/HERO.webp',
            'Assets/images/optimized/logo2.jpg',
            'Assets/images/optimized/logo2.webp',
            'Assets/images/optimized/bedroom1.jpg',
            'Assets/images/optimized/bedroom1.webp',
            'Assets/images/optimized/bedroom2.jpg',
            'Assets/images/optimized/bedroom2.webp',
            'Assets/images/optimized/bedroom4.jpg',
            'Assets/images/optimized/bedroom4.webp'
        ]
    }
    
    print("🔍 CRITICAL FILES STATUS:")
    print("=" * 50)
    
    all_good = True
    for category, files in critical_files.items():
        print(f"\n📁 {category}:")
        for file in files:
            path = Path(file)
            if path.exists():
                size = path.stat().st_size
                print(f"   ✅ {file} ({size} bytes)")
            else:
                print(f"   ❌ {file} - MISSING!")
                all_good = False
    
    return all_good

def main():
    """Start the enhanced debug server"""
    print("🐛 JEFFSTON COURT HOSTEL - DEBUG SERVER")
    print("=" * 50)
    
    # Change to script directory
    script_dir = Path(__file__).parent.absolute()
    os.chdir(script_dir)
    print(f"📁 Working directory: {script_dir}")
    
    # Check critical files
    files_ok = check_critical_files()
    
    if not files_ok:
        print("\n⚠️  WARNING: Some critical files are missing!")
        print("   The website may not display correctly.")
    
    print(f"\n🎯 DEBUG FEATURES:")
    print(f"   • Detailed request logging")
    print(f"   • File existence checking") 
    print(f"   • MIME type debugging")
    print(f"   • Cache disabled for testing")
    print(f"   • Color-coded console output")
    
    try:
        with socketserver.TCPServer((HOST, PORT), DebugHTTPRequestHandler) as httpd:
            server_url = f"http://{HOST}:{PORT}"
            
            print(f"\n🚀 DEBUG SERVER RUNNING:")
            print(f"   URL: {server_url}")
            print(f"   Main site: {server_url}/index.html")
            print(f"   Image test: {server_url}/image-test.html")
            
            print(f"\n📋 DEBUGGING STEPS:")
            print(f"   1. Open browser to: {server_url}")
            print(f"   2. Open DevTools (F12)")
            print(f"   3. Go to Network tab")
            print(f"   4. Hard refresh (Ctrl+F5)")
            print(f"   5. Watch console output below")
            
            print(f"\n🔄 SERVER LOGS:")
            print(f"─" * 50)
            
            # Start serving
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print(f"\n\n🛑 DEBUG SERVER STOPPED")
    except Exception as e:
        print(f"\n❌ SERVER ERROR: {e}")

if __name__ == "__main__":
    main()