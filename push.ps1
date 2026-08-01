$git = "C:\Program Files\Git\cmd\git.exe"

& $git config user.email "dyaanalytics@example.com"
& $git config user.name "DyAAnalytics"

& $git add .
& $git commit -m "Subida inicial: Tucabelo Premium"
& $git branch -M main

& $git remote remove origin 2>$null
& $git remote add origin https://github.com/DyAAnalytics/tucabelo.git
Write-Output "Subiendo a GitHub..."
& $git push -u origin main
