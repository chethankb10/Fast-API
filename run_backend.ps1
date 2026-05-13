$python = Join-Path $PSScriptRoot 'env\Scripts\python.exe'
Set-Location -Path "$PSScriptRoot\backend"
& $python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
