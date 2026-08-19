Set objShell = CreateObject("Shell.Application")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Create a batch file to do the heavy lifting
strBatFile = "C:\Windows\Temp\setup_agenticneuro.bat"
Set objBat = objFSO.CreateTextFile(strBatFile, True)

objBat.WriteLine "@echo off"
objBat.WriteLine "echo Fixing hosts file for agenticneuro and agenticneuro.com..."
objBat.WriteLine "echo. >> C:\Windows\System32\drivers\etc\hosts"
' Remove the broken lines
objBat.WriteLine "findstr /V /C:""agenticneuro"" C:\Windows\System32\drivers\etc\hosts > C:\Windows\System32\drivers\etc\hosts.tmp"
' Add correct lines
objBat.WriteLine "echo 127.0.0.1       localhost >> C:\Windows\System32\drivers\etc\hosts.tmp"
objBat.WriteLine "echo 127.0.0.1       agenticneuro >> C:\Windows\System32\drivers\etc\hosts.tmp"
objBat.WriteLine "echo 127.0.0.1       agenticneuro.com >> C:\Windows\System32\drivers\etc\hosts.tmp"
objBat.WriteLine "copy /Y C:\Windows\System32\drivers\etc\hosts.tmp C:\Windows\System32\drivers\etc\hosts >nul"
objBat.WriteLine "del C:\Windows\System32\drivers\etc\hosts.tmp >nul"
objBat.WriteLine "echo."
objBat.WriteLine "echo Hosts file updated successfully."
objBat.WriteLine "echo Starting web server on port 80..."
objBat.WriteLine "cd /d c:\Users\mohan\.gemini\antigravity\scratch\enterprise-repo-dashboard"
objBat.WriteLine "start http://agenticneuro.com"
objBat.WriteLine "start http://agenticneuro"
objBat.WriteLine "python -m http.server 80"
objBat.Close

' Run the batch file as administrator
objShell.ShellExecute "cmd.exe", "/c """ & strBatFile & """", "", "runas", 1
