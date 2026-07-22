Add-Type -AssemblyName System.Drawing
$inputPath = "d:\Galaxy Decor\assets\logo_round.jpg"
$outputPathCore = "d:\Galaxy Decor\assets\logo_static_core.png"

if (Test-Path $inputPath) {
    Write-Host "Loading logo: $inputPath"
    $bmp = [System.Drawing.Bitmap]::FromFile($inputPath)
    
    $W = $bmp.Width
    $H = $bmp.Height
    Write-Host "Original dimensions: $W x $H"
    
    # 1. Scan for the GOLD border pixels to find the circular bounds
    # Gold has high R and G, and low B: R > 150, G > 120, B < 100
    $minX = $W
    $maxX = 0
    $minY = $H
    $maxY = 0
    
    for ($x = 0; $x -lt $W; $x++) {
        for ($y = 0; $y -lt $H; $y++) {
            $pixel = $bmp.GetPixel($x, $y)
            if ($pixel.R -gt 150 -and $pixel.G -gt 120 -and $pixel.B -lt 100) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    
    $logoWidth = $maxX - $minX
    $logoHeight = $maxY - $minY
    Write-Host "Detected gold logo bounds: X: $minX to $maxX, Y: $minY to $maxY (Size: $logoWidth x $logoHeight)"
    
    if ($logoWidth -le 0 -or $logoHeight -le 0) {
        Write-Host "Error: Could not locate gold logo circle!"
        $bmp.Dispose()
        exit
    }
    
    # Calculate exact center of the gold circle
    $cX = $minX + [int]($logoWidth / 2)
    $cY = $minY + [int]($logoHeight / 2)
    
    # Set total medallion radius based on the gold border circle
    $radius = [int]([Math]::Max($logoWidth, $logoHeight) / 2)
    Write-Host "Medallion Center: ($cX, $cY), Total Radius: $radius"
    
    # Crop to a perfect tight square around the medallion
    $squareSize = $radius * 2
    $startX = $cX - $radius
    $startY = $cY - $radius
    
    Write-Host "Cropping square of size $squareSize x $squareSize at ($startX, $startY)"
    
    # Ensure crop coordinates stay within original image bounds
    if ($startX -lt 0) { $startX = 0 }
    if ($startY -lt 0) { $startY = 0 }
    if (($startX + $squareSize) -gt $W) { $squareSize = $W - $startX }
    if (($startY + $squareSize) -gt $H) { $squareSize = $H - $startY }
    
    $croppedBmp = New-Object System.Drawing.Bitmap($squareSize, $squareSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($croppedBmp)
    
    $srcRect = New-Object System.Drawing.Rectangle($startX, $startY, $squareSize, $squareSize)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $squareSize, $squareSize)
    $g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    $bmp.Dispose()
    $g.Dispose()
    
    # 2. Isolate static core (remove gold border ring: clear everything outside 88% of radius)
    $center = $squareSize / 2
    $coreRadiusThreshold = $radius * 0.88
    
    Write-Host "Isolating static circular core (radius threshold $coreRadiusThreshold)..."
    for ($x = 0; $x -lt $squareSize; $x++) {
        for ($y = 0; $y -lt $squareSize; $y++) {
            $dx = $x - $center
            $dy = $y - $center
            $dist = [Math]::Sqrt($dx * $dx + $dy * $dy)
            
            if ($dist -gt $coreRadiusThreshold) {
                # Make pixels outside the core transparent
                $croppedBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
        }
    }
    
    # Save static core
    $croppedBmp.Save($outputPathCore, [System.Drawing.Imaging.ImageFormat]::Png)
    $croppedBmp.Dispose()
    Write-Host "Success: Centered circular static core saved at $outputPathCore"
} else {
    Write-Host "Error: input logo_round.jpg not found!"
}
