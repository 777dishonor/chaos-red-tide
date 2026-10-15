' Chaos Red Tide - silent dev server launcher (used by Windows Startup folder)
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("Wscript.Shell")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = dir
shell.Run dir & "\start-website.cmd", 0, False
