Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile("d:\Galaxy Decor\assets\logo_round.jpg")
Write-Host "Width: $($bmp.Width) Height: $($bmp.Height)"

# Sample colors along the horizontal center line (y = 293)
$y = [int]($bmp.Height / 2)
Write-Host "Sampling at Y = $y"
for ($x = 0; $x -lt $bmp.Width; $x += 40) {
    $p = $bmp.GetPixel($x, $y)
    Write-Host "Pixel ($x, $y): R=$($p.R) G=$($p.G) B=$($p.B)"
}
$bmp.Dispose()
