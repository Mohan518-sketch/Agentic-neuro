Set objShell = CreateObject("Shell.Application")
objShell.ShellExecute "cmd.exe", "/c echo 127.0.0.1 agenticneuro >> C:\Windows\System32\drivers\etc\hosts && echo DONE", "", "runas", 1
