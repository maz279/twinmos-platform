@echo off
title TwinMOS Platform - Local Dev Stack
cd /d "%~dp0"
echo ============================================================
echo   TwinMOS Platform - Local Development Environment
echo ============================================================
echo   Admin Frontend (Vite SPA):  http://localhost:5173/
echo   Public Website (Astro SSR): http://localhost:4321/
echo   Backend REST API (Hono):    http://127.0.0.1:8787/api/v1/health
echo ============================================================
echo.
npm.cmd run dev
