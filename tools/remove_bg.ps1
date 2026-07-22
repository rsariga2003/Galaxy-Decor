Add-Type -AssemblyName System.Drawing
$inputPath = "d:\Galaxy Decor\assets\logo_round.jpg"
$outputPath = "d:\Galaxy Decor\assets\logo_round.png"

if (Test-Path $inputPath) {
    Write-Host "Loading image: $inputPath"
    $bmp = [System.Drawing.Bitmap]::FromFile($inputPath)
    
    # Calculate crop coordinates for a perfect square in the center
    $W = $bmp.Width
    $H = $bmp.Height
    Write-Host "Original dimensions: $W x $H"
    
    $squareSize = $H
    $startX = [int](($W - $H) / 2)
    $startY = 0
    Write-Host "Cropping square of size $squareSize x $squareSize starting at ($startX, $startY)"
    
    # Create new bitmap for cropped square with transparency support
    $newBmp = New-Object System.Drawing.Bitmap($squareSize, $squareSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($newBmp)
    
    # Draw cropped area
    $srcRect = New-Object System.Drawing.Rectangle($startX, $startY, $squareSize, $squareSize)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $squareSize, $squareSize)
    $g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    $bmp.Dispose()
    $g.Dispose()

    Write-Host "Processing pixels for transparency..."
    for ($x = 0; $x -lt $newBmp.Width; $x++) {
        for ($y = 0; $y -lt $newBmp.Height; $y++) {
            $pixel = $newBmp.GetPixel($x, $y)
            $diff = [Math]::Abs($pixel.R - $pixel.G)
            # Match the dark grey charcoal background
            if ($pixel.R -lt 75 -and $pixel.G -lt 75 -and $pixel.B -lt 75 -and $diff -lt 15) {
                $newBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
        }
    }

    # Save as PNG
    $newBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $newBmp.Dispose()
    Write-Host "Success: Cropped transparent PNG created at $outputPath"
} else {
    Write-Host "Error: input logo_round.jpg not found!"
}
