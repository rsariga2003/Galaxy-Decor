Add-Type -AssemblyName System.Drawing
$inputPath = "d:\Galaxy Decor\assets\logo_round.jpg"
$outputPathLetters = "d:\Galaxy Decor\assets\logo_letters.png"

if (Test-Path $inputPath) {
    Write-Host "Loading new logo: $inputPath"
    $bmp = [System.Drawing.Bitmap]::FromFile($inputPath)
    
    $W = $bmp.Width
    $H = $bmp.Height
    Write-Host "Original size: $W x $H"
    
    # Crop to center square
    $squareSize = $H
    if ($W -lt $H) { $squareSize = $W }
    $startX = [int](($W - $squareSize) / 2)
    $startY = [int](($H - $squareSize) / 2)
    
    Write-Host "Cropping square at ($startX, $startY) with size $squareSize x $squareSize"
    
    $newBmp = New-Object System.Drawing.Bitmap($squareSize, $squareSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($newBmp)
    
    $srcRect = New-Object System.Drawing.Rectangle($startX, $startY, $squareSize, $squareSize)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $squareSize, $squareSize)
    $g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    $bmp.Dispose()
    $g.Dispose()
    
    # Process pixels to isolate GD letters
    $cX = $squareSize / 2
    $cY = $squareSize / 2
    
    Write-Host "Isolating GD letters..."
    for ($x = 0; $x -lt $squareSize; $x++) {
        for ($y = 0; $y -lt $squareSize; $y++) {
            $pixel = $newBmp.GetPixel($x, $y)
            $dx = $x - $cX
            $dy = $y - $cY
            $distance = [Math]::Sqrt($dx * $dx + $dy * $dy)
            
            # 1. Clear everything outside the letters boundary
            # G curves further to the left, so we extend threshold on the left
            $threshold = 165
            if ($dx -lt 0 -and $dy -lt 120) {
                $threshold = 210
            }
            if ($dx -gt 0 -and $dy -gt -120) {
                $threshold = 200
            }
            
            if ($distance -gt $threshold) {
                $newBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
                continue
            }
            
            # 2. Clear charcoal background inside
            # Charcoal is around RGB (40-60)
            if ($pixel.R -lt 85 -and $pixel.G -lt 85 -and $pixel.B -lt 85) {
                $newBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
                continue
            }
            
            # 3. Clear white canvas background if any
            if ($pixel.R -gt 220 -and $pixel.G -gt 220 -and $pixel.B -gt 220) {
                $newBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
        }
    }
    
    # Save isolated letters
    $newBmp.Save($outputPathLetters, [System.Drawing.Imaging.ImageFormat]::Png)
    $newBmp.Dispose()
    Write-Host "Success: Isolated GD letters saved at $outputPathLetters"
} else {
    Write-Host "Error: input logo_round.jpg not found!"
}
