"""
FitnesBot - Unified Local Backup Server with Cloudflare Tunnel & Failover
"""

import asyncio
import json
import logging
import os
import re
import subprocess
import sys
import threading
import time
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uvicorn

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s : %(message)s"
)
logger = logging.getLogger("unified_server")

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR / "fitnesuzb_bot"
LOCAL_TZ = ZoneInfo("Asia/Tashkent")
PORT = int(os.getenv("PORT", 8005))

app = FastAPI(title="FitnesBot Unified Server")


@app.get("/")
async def root():
    return {
        "service": "FitnesBot Unified Backup Server",
        "status": "running",
        "mode": "local_backup",
        "port": PORT,
        "timestamp": datetime.now(LOCAL_TZ).isoformat()
    }


@app.get("/health")
@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "service": "fitnes-bot",
        "mode": "local_backup",
        "port": PORT,
        "timestamp": datetime.now(LOCAL_TZ).isoformat()
    }


@app.get("/api/status")
async def api_status():
    tunnel_file = BASE_DIR / "tunnel_url.txt"
    tunnel_url = tunnel_file.read_text(encoding="utf-8").strip() if tunnel_file.exists() else None
    return {
        "status": "healthy",
        "service": "fitnes-bot",
        "active_tunnel": tunnel_url,
        "timezone": "Asia/Tashkent",
        "current_time": datetime.now(LOCAL_TZ).strftime("%Y-%m-%d %H:%M:%S")
    }


@app.post("/api/trigger-reminder")
async def api_trigger_reminder(request: Request):
    try:
        body = await request.json()
    except Exception:
        body = {}
    reminder_type = body.get("type", "morning")
    npx_bin = "npx.cmd" if sys.platform == "win32" else "npx"
    cmd = f'{npx_bin} tgcloud run endpoints/sendDailyReminders "{{\\"type\\":\\"{reminder_type}\\"}}"'
    try:
        res = subprocess.run(cmd, shell=True, cwd=str(PROJECT_DIR), capture_output=True, text=True)
        return {"ok": True, "type": reminder_type, "output": res.stdout.strip()}
    except Exception as e:
        return JSONResponse(status_code=500, content={"ok": False, "error": str(e)})


def update_vercel_json_and_push(tunnel_url: str):
    vercel_path = BASE_DIR / "vercel.json"
    if not vercel_path.exists():
        logger.warning("vercel.json not found, skipping sync.")
        return

    try:
        with open(vercel_path, "r", encoding="utf-8") as f:
            content = f.read()

        old_pattern = r'https://[a-zA-Z0-9\.\-]+\.(?:onrender\.com|trycloudflare\.com)'
        new_content = re.sub(old_pattern, tunnel_url, content)

        if new_content != content:
            with open(vercel_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            logger.info(f"Updated vercel.json with active tunnel: {tunnel_url}")

            subprocess.run(["git", "add", "vercel.json"], cwd=str(BASE_DIR), check=True)
            subprocess.run(["git", "commit", "-m", f"chore(tunnel): route traffic to {tunnel_url}"], cwd=str(BASE_DIR), check=True)
            subprocess.run(["git", "push", "origin", "main"], cwd=str(BASE_DIR), check=True)
            logger.info("✅ Pushed new tunnel route to GitHub for instant Vercel sync!")
        else:
            logger.info("vercel.json is already pointing to current tunnel URL.")
    except Exception as e:
        logger.warning(f"Could not automatically sync vercel.json: {e}")


def start_cloudflared_tunnel(port: int):
    cf_binary = BASE_DIR / "cloudflared.exe"
    if not cf_binary.exists():
        logger.error(f"cloudflared.exe not found at {cf_binary}")
        return None, None

    cmd = [str(cf_binary), "tunnel", "--url", f"http://127.0.0.1:{port}", "--no-autoupdate"]
    logger.info(f"Starting Cloudflare Tunnel on http://127.0.0.1:{port} ...")
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
        line_clean = line.strip()
        if "trycloudflare.com" in line_clean:
            match = re.search(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", line_clean)
            if match:
                tunnel_url = match.group(0)
                break

    if not tunnel_url:
        logger.error("Failed to extract tunnel URL within 35 seconds.")
        proc.terminate()
        return None, None

    logger.info(f"✅ Live Cloudflare Tunnel URL: {tunnel_url}")
    with open(BASE_DIR / "tunnel_url.txt", "w", encoding="utf-8") as f:
        f.write(tunnel_url)

    return proc, tunnel_url


def drain_pipe(proc):
    try:
        for _ in iter(proc.stdout.readline, ''):
            pass
    except Exception:
        pass


async def cron_reminder_loop():
    logger.info("⏰ Cron Reminder Scheduler loop started (05:00 & 21:00 Tashkent)...")
    sent_morning_date = None
    sent_evening_date = None

    while True:
        try:
            now = datetime.now(LOCAL_TZ)
            today_str = now.strftime("%Y-%m-%d")
            current_time = now.strftime("%H:%M")

            if current_time == "05:00" and sent_morning_date != today_str:
                logger.info("🌅 Triggering 05:00 morning reminder...")
                npx_bin = "npx.cmd" if sys.platform == "win32" else "npx"
                cmd = f'{npx_bin} tgcloud run endpoints/sendDailyReminders "{{\\"type\\":\\"morning\\"}}"'
                subprocess.run(cmd, shell=True, cwd=str(PROJECT_DIR), capture_output=True, text=True)
                sent_morning_date = today_str

            if current_time == "21:00" and sent_evening_date != today_str:
                logger.info("🌙 Triggering 21:00 evening reminder...")
                npx_bin = "npx.cmd" if sys.platform == "win32" else "npx"
                cmd = f'{npx_bin} tgcloud run endpoints/sendDailyReminders "{{\\"type\\":\\"evening\\"}}"'
                subprocess.run(cmd, shell=True, cwd=str(PROJECT_DIR), capture_output=True, text=True)
                sent_evening_date = today_str
        except Exception as e:
            logger.error(f"Error in cron reminder loop: {e}")

        await asyncio.sleep(25)


async def main():
    logger.info("=" * 60)
    logger.info(f"🚀 Starting FitnesBot Unified Server on port {PORT}...")
    logger.info("=" * 60)

    # 1. Start Cloudflare Tunnel
    cf_proc, tunnel_url = start_cloudflared_tunnel(PORT)
    if tunnel_url:
        update_vercel_json_and_push(tunnel_url)
        threading.Thread(target=drain_pipe, args=(cf_proc,), daemon=True).start()
    else:
        logger.warning("Could not establish Cloudflare Tunnel. Continuing with local server only.")

    # 2. Start Cron Scheduler loop
    asyncio.create_task(cron_reminder_loop())

    # 3. Start Uvicorn Server
    config = uvicorn.Config(app, host="127.0.0.1", port=PORT, log_level="info")
    server = uvicorn.Server(config)
    await server.serve()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server terminated by user.")
