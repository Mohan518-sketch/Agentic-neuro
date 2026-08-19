Set objShell = CreateObject("Shell.Application")
Dim cmd
cmd = "/k (pip install cryptography) && " & _
      "(cd /d c:\Users\mohan\.gemini\antigravity\scratch\enterprise-repo-dashboard) && " & _
      "(echo Starting Secure Server at https://agenticneuro ...) && " & _
      "(python secure_server.py)"

objShell.ShellExecute "cmd.exe", cmd, "", "runas", 1
