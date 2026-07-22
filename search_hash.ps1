Select-String -Path "d:\Galaxy Decor\index.html" -Pattern 'href="#' | Select-Object -Property LineNumber, Line
Select-String -Path "d:\Galaxy Decor\js\app.js" -Pattern 'location\.hash' | Select-Object -Property LineNumber, Line
Select-String -Path "d:\Galaxy Decor\js\router.js" -Pattern 'location\.hash' | Select-Object -Property LineNumber, Line
