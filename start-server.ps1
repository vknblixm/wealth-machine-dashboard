$host.UI.RawUI.WindowTitle = 'NextDev'
$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')
Set-Location 'C:\Users\Admin\Downloads\FounderOS-DEMO-main\wealth-machine-dashboard'
$proc = Start-Process -FilePath 'node.exe' -ArgumentList 'node_modules\next\dist\bin\next','dev','-p','4200' -RedirectStandardOutput 'C:\Users\Admin\Downloads\FounderOS-DEMO-main\.freebuff\preview-56b67439-681a-4df4-a1e1-25bf4cb071b7.log' -RedirectStandardError 'C:\Users\Admin\Downloads\FounderOS-DEMO-main\.freebuff\preview-56b67439-681a-4df4-a1e1-25bf4cb071b7.log.err' -NoNewWindow -PassThru
$proc.Id
