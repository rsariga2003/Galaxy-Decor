$app = Get-Content 'd:\Galaxy Decor\js\app.js'
$app = $app -replace '(?<!/|''|")assets/', '/assets/'
$app = $app -replace 'url\(''assets/', 'url(''/assets/'
$app = $app -replace 'url\("assets/', 'url("/assets/'
$app = $app -replace '"assets/', '"/assets/'
$app = $app -replace '''assets/', '''/assets/'
# Also replace the 'assets/products/' fallback inside functions
$app = $app -replace ': `assets/products/\${', ': `/assets/products/${'
$app = $app -replace ': ''assets/products/''', ': ''/assets/products/'''
Set-Content 'd:\Galaxy Decor\js\app.js' $app

$data = Get-Content 'd:\Galaxy Decor\js\data.js'
$data = $data -replace '"assets/', '"/assets/'
Set-Content 'd:\Galaxy Decor\js\data.js' $data
