import asyncio
import logging
import os
import re
import subprocess
import sys
import time
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(name)s : %(message)s")
logger = logging.getLogger("tunnel_runner")

BASE_DIR = Path(__file__).resolve().parent

def get_quick_tunnel(port: int = 8000):
    cf_binary = BASE_DIR / "cloudflared.exe"
    if not cf_binary.exists():
        logger.error(f"cloudflared.exe not found at {cf_binary}")
        return None, None

    cmd = [str(cf_binary), "tunnel", "--url", f"http://127.0.0.1:{port}", "--no-autoupdate"]
    logger.info(f"Spawning Cloudflare quick tunnel on port {port}...")
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    tunnel_url = None
    start = time.time()
    while time.time() - start < 35:
        line = proc.stdout.readline()
        if not line:
            time.sleep(0.1)
            continue
        line_str = line.strip()
        if "trycloudflare.com" in line_str:
            match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line_str)
            if match:
                tunnel_url = match.group(0)
                break
    
    if not tunnel_url:
        logger.error("Could not obtain trycloudflare.com URL within 35 seconds")
        proc.terminate()
        return None, None

    logger.info(f"✅ TUNNEL ESTABLISHED: {tunnel_url}")
    with open(BASE_DIR / "tunnel_url.txt", "w", encoding="utf-8") as f:
        f.write(tunnel_url)
    
    return proc, tunnel_url

if __name__ == "__main__":
    proc, url = get_quick_tunnel()
    if url:
        print(f"ACTIVE_URL={url}")
    else:
        sys.exit(1)
