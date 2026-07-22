Add-Type -AssemblyName System.Drawing
$inputPath = "d:\Galaxy Decor\assets\logo_round.png"
$outputPath = "d:\Galaxy Decor\assets\logo_letters.png"

if (Test-Path $inputPath) {
    Write-Host "Loading transparent logo: $inputPath"
    $bmp = [System.Drawing.Bitmap]::FromFile($inputPath)
    
    $W = $bmp.Width
    $H = $bmp.Height
    $cX = $W / 2
    $cY = $H / 2
    
    Write-Host "Image size: $W x $H, Center: ($cX, $cY)"
    
    # Create a copy to edit
    $newBmp = New-Object System.Drawing.Bitmap($W, $H, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($newBmp)
    $g.DrawImage($bmp, 0, 0)
    $bmp.Dispose()
    $g.Dispose()

    Write-Host "Isolating 'GD' letters using intelligent quadrant thresholds..."
    
    for ($x = 0; $x -lt $W; $x++) {
        for ($y = 0; $y -lt $H; $y++) {
            $dx = $x - $cX
            $dy = $y - $cY
            $distance = [Math]::Sqrt($dx * $dx + $dy * $dy)
            
            # Base threshold
            $threshold = 165
            
            # Adjust threshold to prevent clipping G on the left
            if ($dx -lt 0) {
                # Left side
                if ($dy -lt 130) {
                    # Keep full G letter curve
                    $threshold = 210
                }
            }
            # Adjust threshold to prevent clipping D on the right
            if ($dx -gt 0) {
                # Right side
                if ($dy -gt -130) {
                    # Keep full D letter curve
                    $threshold = 200
                }
            }
            
            if ($distance -gt $threshold) {
                # Set pixel to fully transparent
                $newBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
        }
    }

    # Save letters image
    $newBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $newBmp.Dispose()
    Write-Host "Success: Isolated 'GD' letters saved at $outputPath"
} else {
    Write-Host "Error: input logo_round.png not found!"
}
