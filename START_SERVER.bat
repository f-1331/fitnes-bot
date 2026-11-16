@echo off
title FitnesBot - Unified Server & Render Watchdog
cd /d "%~dp0"
echo =======================================================
echo   FitnesBot System - Local Server + Auto Failback
echo =======================================================
start "Render Auto-Watchdog" /min python render_failback_watchdog.py
python run_unified_server.py
pause
