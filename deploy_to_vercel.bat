@echo off
echo Preparing Deployment...
set PATH=%CD%\node-v20.11.1-win-x64;%PATH%
cd Deploy_To_Vercel
npx -y vercel --prod
pause
