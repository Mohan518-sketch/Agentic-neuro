Set objShell = CreateObject("Shell.Application")
objShell.ShellExecute "powershell.exe", "-ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -Command ""Import-Certificate -FilePath 'c:\Users\mohan\.gemini\antigravity\scratch\enterprise-repo-dashboard\server.pem' -CertStoreLocation Cert:\LocalMachine\Root""", "", "runas", 1
