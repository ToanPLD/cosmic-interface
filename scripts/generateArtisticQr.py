import sys
import os
import argparse
from amzqr import amzqr

# Auto-detect local LAN IP
def detect_lan_ip():
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return 'localhost'

def main():
    parser = argparse.ArgumentParser(description="Generate Artistic Floral QR Code")
    parser.add_argument('--url', type=str, default=None, help="Target URL to encode")
    parser.add_argument('--picture', type=str, default='public/artistic-rose-template.png', help="Background image for QR")
    parser.add_argument('--out', type=str, default='output/gift-card', help="Output directory")
    parser.add_argument('--name', type=str, default='artistic-qr-rose.png', help="Output file name")
    parser.add_argument('--contrast', type=float, default=1.3, help="Contrast adjustment")
    parser.add_argument('--brightness', type=float, default=1.1, help="Brightness adjustment")
    args = parser.parse_args()

    target_url = args.url
    if not target_url:
        lan_ip = detect_lan_ip()
        target_url = f"http://{lan_ip}:3000"

    os.makedirs(args.out, exist_ok=True)

    print(f"[Artistic QR] Generating floral QR code for: {target_url}")
    print(f" - Image source: {args.picture}")
    print(f" - Output file:  {os.path.join(args.out, args.name)}")

    version, level, qr_name = amzqr.run(
        target_url,
        version=3,
        level='H',
        picture=args.picture,
        colorized=True,
        contrast=args.contrast,
        brightness=args.brightness,
        save_name=args.name,
        save_dir=args.out
    )

    print(f"[Artistic QR] Done! Generated Version {version} with Level {level} -> {qr_name}")

if __name__ == '__main__':
    main()
