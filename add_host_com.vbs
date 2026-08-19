Set objFSO = CreateObject("Scripting.FileSystemObject")
strHostsFile = "C:\Windows\System32\drivers\etc\hosts"
Set objFile = objFSO.OpenTextFile(strHostsFile, 8)
objFile.WriteLine "127.0.0.1 agenticneuro.com"
objFile.Close
