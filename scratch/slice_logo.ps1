[void][System.Reflection.Assembly]::LoadWithPartialName('System.Drawing')

$logoPath = "d:\Galaxy Decor\assets\logo_uploaded.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($logoPath)
$width = $bmp.Width
$height = $bmp.Height

# Setup coordinates for 1000x1000 image
# Center is (500, 500)
$cx = $width / 2
$cy = $height / 2

# 1. Separate Outer Gold Ring (from radius 415 to 480)
# We will create an alpha mask where everything outside this ring is transparent.
$ringBmp = New-Object System.Drawing.Bitmap $width, $height
$gRing = [System.Drawing.Graphics]::FromImage($ringBmp)
$gRing.Clear([System.Drawing.Color]::Transparent)

for ($x = 0; $x -lt $width; $x++) {
    for ($y = 0; $y -lt $height; $y++) {
        $dx = $x - $cx
        $dy = $y - $cy
        $dist = [Math]::Sqrt($dx*$dx + $dy*$dy)
        
        # Outer Gold Ring radius bounds in 1000x1000 image: 415 to 480
        # Smooth anti-aliased edge mask:
        if ($dist -ge 412 -and $dist -le 482) {
            $color = $bmp.GetPixel($x, $y)
            # Make sure it's the gold color, exclude any white background noise
            if ($color.R -gt 120 -or $color.G -gt 100) {
                # Antialiasing edges
                $alpha = 255
                if ($dist -lt 415) { $alpha = [int]((($dist - 412) / 3.0) * 255) }
                elseif ($dist -gt 479) { $alpha = [int](((482 - $dist) / 3.0) * 255) }
                $cl = [System.Drawing.Color]::FromArgb($alpha, $color.R, $color.G, $color.B)
                $ringBmp.SetPixel($x, $y, $cl)
            }
        }
    }
}
$ringBmp.Save("d:\Galaxy Decor\assets\logo_outer_ring.png", [System.Drawing.Imaging.ImageFormat]::Png)
$ringBmp.Dispose()
$gRing.Dispose()

# 2. Separate Inner Logo (Fixed black disc + Golden GD letters)
# Includes everything inside radius 415.
$innerBmp = New-Object System.Drawing.Bitmap $width, $height
$gInner = [System.Drawing.Graphics]::FromImage($innerBmp)
$gInner.Clear([System.Drawing.Color]::Transparent)

# In the original image, there are 4 stars:
# Star 1 (Top-Right): centered near (590, 290), size ~60px
# Star 2 (Top-Right): centered near (675, 340), size ~50px
# Star 3 (Bottom-Left): centered near (310, 600), size ~40px
# Star 4 (Bottom-Left): centered near (380, 650), size ~50px
# We need to erase these stars from the inner logo so they don't render statically under the animated stars.

for ($x = 0; $x -lt $width; $x++) {
    for ($y = 0; $y -lt $height; $y++) {
        $dx = $x - $cx
        $dy = $y - $cy
        $dist = [Math]::Sqrt($dx*$dx + $dy*$dy)
        
        if ($dist -lt 414) {
            # Check if this pixel is inside any of the star regions to erase them from inner background
            $isStar1 = ([Math]::Sqrt([Math]::Pow($x - 590, 2) + [Math]::Pow($y - 290, 2)) -lt 45)
            $isStar2 = ([Math]::Sqrt([Math]::Pow($x - 675, 2) + [Math]::Pow($y - 340, 2)) -lt 35)
            $isStar3 = ([Math]::Sqrt([Math]::Pow($x - 310, 2) + [Math]::Pow($y - 600, 2)) -lt 35)
            $isStar4 = ([Math]::Sqrt([Math]::Pow($x - 380, 2) + [Math]::Pow($y - 650, 2)) -lt 45)
            
            if (-not ($isStar1 -or $isStar2 -or $isStar3 -or $isStar4)) {
                $color = $bmp.GetPixel($x, $y)
                # Anti-alias boundary
                $alpha = 255
                if ($dist -gt 410) { $alpha = [int](((414 - $dist) / 4.0) * 255) }
                $cl = [System.Drawing.Color]::FromArgb($alpha, $color.R, $color.G, $color.B)
                $innerBmp.SetPixel($x, $y, $cl)
            } else {
                # Fill the star area on the dark circle with the dark grey color of the inner background disk
                # Center dark grey disk color is roughly (34, 37, 41)
                $cl = [System.Drawing.Color]::FromArgb(255, 34, 37, 41)
                $innerBmp.SetPixel($x, $y, $cl)
            }
        }
    }
}
$innerBmp.Save("d:\Galaxy Decor\assets\logo_inner_fixed.png", [System.Drawing.Imaging.ImageFormat]::Png)
$innerBmp.Dispose()
$gInner.Dispose()


# Helper function to crop a bounding box of a star, mask it by selecting only bright yellow pixels, and save it
function Save-Star($starX, $starY, $radius, $fileName) {
    $size = $radius * 2
    $starBmp = New-Object System.Drawing.Bitmap $size, $size
    
    for ($sx = 0; $sx -lt $size; $sx++) {
        for ($sy = 0; $sy -lt $size; $sy++) {
            $srcX = $starX - $radius + $sx
            $srcY = $starY - $radius + $sy
            
            if ($srcX -ge 0 -and $srcX -lt $width -and $srcY -ge 0 -and $srcY -lt $height) {
                # Calculate local radius to clip inside circle
                $dx = $sx - $radius
                $dy = $sy - $radius
                $d = [Math]::Sqrt($dx*$dx + $dy*$dy)
                
                $color = $bmp.GetPixel($srcX, $srcY)
                # Filter for gold/yellow star pixels (Red > 120, Green > 100, Blue < 150)
                if ($color.R -gt 150 -and $color.G -gt 120 -and $d -le $radius) {
                    $alpha = 255
                    # Fade out edges
                    if ($d -gt ($radius - 4)) {
                        $alpha = [int]((($radius - $d) / 4.0) * 255)
                        if ($alpha -lt 0) { $alpha = 0 }
                    }
                    $cl = [System.Drawing.Color]::FromArgb($alpha, $color.R, $color.G, $color.B)
                    $starBmp.SetPixel($sx, $sy, $cl)
                } else {
                    $starBmp.SetPixel($sx, $sy, [System.Drawing.Color]::Transparent)
                }
            }
        }
    }
    $starBmp.Save($fileName, [System.Drawing.Imaging.ImageFormat]::Png)
    $starBmp.Dispose()
}

# 3. Separate Stars
Save-Star 590 290 40 "d:\Galaxy Decor\assets\logo_star1.png"
Save-Star 675 340 32 "d:\Galaxy Decor\assets\logo_star2.png"
Save-Star 310 600 32 "d:\Galaxy Decor\assets\logo_star3.png"
Save-Star 380 650 40 "d:\Galaxy Decor\assets\logo_star4.png"

$bmp.Dispose()
Write-Host "Logo mask separation completed successfully!"
