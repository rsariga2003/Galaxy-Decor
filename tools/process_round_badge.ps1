Add-Type -AssemblyName System.Drawing
$inputPath = "d:\Galaxy Decor\assets\logo_round.jpg"
$outputPath = "d:\Galaxy Decor\assets\logo_round.png"

if (Test-Path $inputPath) {
    Write-Host "Loading logo: $inputPath"
    $bmp = [System.Drawing.Bitmap]::FromFile($inputPath)
    
    $W = $bmp.Width
    $H = $bmp.Height
    Write-Host "Original size: $W x $H"
    
    # Crop to center square
    $squareSize = $H
    if ($W -lt $H) { $squareSize = $W }
    $startX = [int](($W - $squareSize) / 2)
    $startY = [int](($H - $squareSize) / 2)
    
    $newBmp = New-Object System.Drawing.Bitmap($squareSize, $squareSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($newBmp)
    
    $srcRect = New-Object System.Drawing.Rectangle($startX, $startY, $squareSize, $squareSize)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $squareSize, $squareSize)
    $g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    $bmp.Dispose()
    $g.Dispose()
    
    # Process pixels to remove background outside the circle
    $cX = $squareSize / 2
    $cY = $squareSize / 2
    
    # The golden circle outer radius is roughly 245 pixels
    $radiusThreshold = 245
    
    Write-Host "Removing background outside the circular logo..."
    for ($x = 0; $x -lt $squareSize; $x++) {
        for ($y = 0; $y -lt $squareSize; $y++) {
            $dx = $x - $cX
            $dy = $y - $cY
            $distance = [Math]::Sqrt($dx * $dx + $dy * $dy)
            
            # If outside the circular gold ring, make it transparent
            if ($distance -gt $radiusThreshold) {
                $newBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
            # Handle potential edge pixels near the border
            else {
                $pixel = $newBmp.GetPixel($x, $y)
                # If it's a white background pixel outside the gold circle
                if ($distance -gt 238 -and $pixel.R -gt 200 -and $pixel.G -gt 200 -and $pixel.B -gt 200) {
                    $newBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
                }
            }
        }
    }
    
    # Save transparent badge
    $newBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $newBmp.Dispose()
    Write-Host "Success: Circular badge saved at $outputPath"
} else {
    Write-Host "Error: input logo_round.jpg not found!"
}
