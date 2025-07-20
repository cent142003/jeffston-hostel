#!/usr/bin/env python3
"""
Simple HTTP Server for Jeffston Court Hostel Website
Run this script to serve your website locally and fix image loading issues.
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

# Configuration
PORT = 8000
HOST = 'localhost'

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler with better MIME type support and CORS headers"""
    
    def end_headers(self):
        # Add CORS headers to allow local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def guess_type(self, path):
        """Better MIME type guessing for images"""
        mimetype, encoding = super().guess_type(path)
        
        # Handle WebP images specifically
        if path.lower().endswith('.webp'):
            return 'image/webp'
        elif path.lower().endswith('.jpg') or path.lower().endswith('.jpeg'):
            return 'image/jpeg'
        elif path.lower().endswith('.png'):
            return 'image/png'
        
        return mimetype, encoding
    
    def log_message(self, format, *args):
        """Custom logging to show which files are being requested"""
        message = format % args
        print(f"[{self.address_string()}] {message}")

def check_files():
    """Check if critical files exist"""
    required_files = [
        'index.html',
        'style.css', 
        'scripts.js',
        'Assets/images/optimized/HERO.jpg',
        'Assets/images/optimized/HERO.webp',
        'Assets/images/optimized/logo2.jpg',
        'Assets/images/optimized/bedroom1.jpg',
        'Assets/images/optimized/bedroom2.jpg',
        'Assets/images/optimized/NEW4.jpg'
    ]
    
    missing_files = []
    for file in required_files:
        if not Path(file).exists():
            missing_files.append(file)
    
    if missing_files:
        print("⚠️  WARNING: Missing files detected:")
        for file in missing_files:
            print(f"   - {file}")
        print()
    else:
        print("✅ All critical files found!")
    
    return len(missing_files) == 0

def main():
    """Start the local development server"""
    print("🏠 Jeffston Court Hostel - Local Development Server")
    print("=" * 50)
    
    # Change to the script directory
    script_dir = Path(__file__).parent.absolute()
    os.chdir(script_dir)
    print(f"📁 Serving from: {script_dir}")
    
    # Check if files exist
    if not check_files():
        print("⚠️  Some files are missing, but server will start anyway.")
        print("   Check the paths if images don't load properly.")
    
    print()
    
    try:
        # Create server
        with socketserver.TCPServer((HOST, PORT), CustomHTTPRequestHandler) as httpd:
            server_url = f"http://{HOST}:{PORT}"
            print(f"🚀 Server starting at: {server_url}")
            print(f"📱 Main website: {server_url}/index.html")
            print(f"🔍 Image test page: {server_url}/image-test.html")
            print()
            print("💡 Tips:")
            print("   - Use Ctrl+C to stop the server")
            print("   - Refresh your browser if images don't load immediately")
            print("   - Check the console for any error messages")
            print()
            print("🌐 Opening website in your default browser...")
            
            # Try to open browser automatically
            try:
                webbrowser.open(f"{server_url}/image-test.html")
            except Exception as e:
                print(f"   Could not open browser automatically: {e}")
                print(f"   Please manually navigate to: {server_url}")
            
            print("\n🔄 Server logs:")
            print("-" * 30)
            
            # Start serving
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Port {PORT} is already in use!")
            print(f"   Try a different port by editing PORT in this script")
            print(f"   Or stop the other server using port {PORT}")
        else:
            print(f"❌ Server error: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()