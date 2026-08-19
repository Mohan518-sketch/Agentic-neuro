' Fix hosts file - ensure agenticneuro is on its own line
Set objFSO = CreateObject("Scripting.FileSystemObject")
Set objShell = CreateObject("Shell.Application")

' Fix hosts and start server in one elevated cmd
Dim cmd
cmd = "/k (echo. >> C:\Windows\System32\drivers\etc\hosts) && " & _
      "(findstr /V /C:""localhost127"" C:\Windows\System32\drivers\etc\hosts > C:\Windows\System32\drivers\etc\hosts.tmp) && " & _
      "(echo 127.0.0.1       localhost >> C:\Windows\System32\drivers\etc\hosts.tmp) && " & _
      "(echo 127.0.0.1       agenticneuro >> C:\Windows\System32\drivers\etc\hosts.tmp) && " & _
      "(copy /Y C:\Windows\System32\drivers\etc\hosts.tmp C:\Windows\System32\drivers\etc\hosts) && " & _
      "(del C:\Windows\System32\drivers\etc\hosts.tmp) && " & _
      "(echo Hosts file fixed!) && " & _
      "(cd /d c:\Users\mohan\.gemini\antigravity\scratch\enterprise-repo-dashboard) && " & _
      "(echo Starting server at http://agenticneuro ...) && " & _
      "(python -m http.server 80)"

objShell.ShellExecute "cmd.exe", cmd, "", "runas", 1
