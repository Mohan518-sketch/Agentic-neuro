@echo off
echo ===========================================
echo STEP 1: Logging into Vercel...
echo ===========================================
set PATH=%CD%\..\node-v20.11.1-win-x64;%PATH%
call ..\node_modules\.bin\vercel.cmd login > deploy_log.txt 2>&1

echo ===========================================
echo STEP 2: Deploying Website...
echo ===========================================
call ..\node_modules\.bin\vercel.cmd --prod --yes >> deploy_log.txt 2>&1

echo ===========================================
echo Done!
pause
