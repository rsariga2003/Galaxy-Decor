$app = Get-Content 'd:\Galaxy Decor\js\app.js'
$app = $app -replace 'window\.location\.hash\s*=\s*"#/(.*?)"', 'window.GalaxyRouter.navigate("/$1")'
$app = $app -replace 'window\.location\.hash\s*=\s*`#/(.*?)`', 'window.GalaxyRouter.navigate(`/$1`)'
$app = $app -replace "window\.location\.hash\s*=\s*'#/(.*?)'", "window.GalaxyRouter.navigate('/$1')"
$app = $app -replace 'window\.location\.hash\s*===\s*"#/contact"', 'window.location.pathname === "/contact"'
$app = $app -replace 'let currentHash = window\.location\.hash \|\| "#/";', 'let currentHash = window.location.pathname;'
$app = $app -replace 'if \(currentHash\.startsWith\("#/wishlist"\)\)', 'if (currentHash.startsWith("/wishlist"))'
Set-Content 'd:\Galaxy Decor\js\app.js' $app

$idx = Get-Content 'd:\Galaxy Decor\index.html'
$idx = $idx -replace 'const hash = window\.location\.hash;', 'const hash = window.location.pathname;'
$idx = $idx -replace 'const isHome = hash === "" \|\| hash === "#/" \|\| hash\.startsWith\("#/home"\) \|\| !hash;', 'const isHome = hash === "" || hash === "/" || hash.startsWith("/home") || !hash;'
$idx = $idx -replace 'window\.addEventListener\("hashchange", updateBodyPageClass\);', 'window.addEventListener("popstate", updateBodyPageClass);'
Set-Content 'd:\Galaxy Decor\index.html' $idx
