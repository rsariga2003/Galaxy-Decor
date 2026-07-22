$content = Get-Content 'd:\Galaxy Decor\index.html'
$content = $content -replace 'href="#/', 'href="/'
$content = $content -replace 'href="css/', 'href="/css/'
$content = $content -replace 'src="js/', 'src="/js/'
$content = $content -replace 'src="assets/', 'src="/assets/'
Set-Content 'd:\Galaxy Decor\index.html' $content

$admin = Get-Content 'd:\Galaxy Decor\admin.html'
$admin = $admin -replace 'href="css/', 'href="/css/'
$admin = $admin -replace 'src="js/', 'src="/js/'
$admin = $admin -replace 'src="assets/', 'src="/assets/'
Set-Content 'd:\Galaxy Decor\admin.html' $admin
