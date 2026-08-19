Set objShell = CreateObject("Shell.Application")
objShell.ShellExecute "powershell.exe", "-ExecutionPolicy Bypass -NoProfile -Command ""Import-Certificate -FilePath 'c:\Users\mohan\.gemini\antigravity\scratch\enterprise-repo-dashboard\cert.pem' -CertStoreLocation Cert:\LocalMachine\Root""", "", "runas", 1
