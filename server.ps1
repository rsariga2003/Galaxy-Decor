$port = 3001
$root = 'd:\Galaxy Decor'

Add-Type -AssemblyName System.Net.Http

$http = New-Object System.Net.HttpListener
$http.Prefixes.Add("http://localhost:$port/")
$http.Start()

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Galaxy Decor - Local Server Started!" -ForegroundColor Green
Write-Host "  URL: http://localhost:$port" -ForegroundColor Yellow
Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan

while ($http.IsListening) {
    $ctx = $http.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response

    $urlPath = $req.Url.LocalPath
    if ($urlPath -eq '/') { $urlPath = '/index.html' }

    $filePath = Join-Path $root $urlPath.TrimStart('/')

    if (Test-Path $filePath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $mime = switch ($ext) {
            '.html' { 'text/html; charset=utf-8' }
            '.css'  { 'text/css; charset=utf-8' }
            '.js'   { 'application/javascript; charset=utf-8' }
            '.png'  { 'image/png' }
            '.jpg'  { 'image/jpeg' }
            '.jpeg' { 'image/jpeg' }
            '.gif'  { 'image/gif' }
            '.svg'  { 'image/svg+xml' }
            '.ico'  { 'image/x-icon' }
            '.webp' { 'image/webp' }
            '.json' { 'application/json' }
            default { 'application/octet-stream' }
        }
        $res.ContentType = $mime
        $res.StatusCode = 200
        $res.AddHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        $res.AddHeader("Pragma", "no-cache")
        $res.AddHeader("Expires", "0")
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $res.StatusCode = 404
        $notFound = [System.Text.Encoding]::UTF8.GetBytes("<h2>404 Not Found: $urlPath</h2>")
        $res.ContentType = 'text/html'
        $res.ContentLength64 = $notFound.Length
        $res.OutputStream.Write($notFound, 0, $notFound.Length)
    }

    $res.OutputStream.Close()
}
