Set objShell = CreateObject("Shell.Application")
objShell.ShellExecute "cmd.exe", "/k cd /d c:\Users\mohan\.gemini\antigravity\scratch\enterprise-repo-dashboard && python -m http.server 80", "", "runas", 1
