Add-Type -AssemblyName System.Drawing

$imgPath = "c:\dev\xto\255c889a-368d-4f4f-a497-ab4be6e6a052.png"
$src = [System.Drawing.Bitmap]::FromFile($imgPath)

# 1. Avatar of Aditya
$rectAvatar = New-Object System.Drawing.Rectangle(1285, 19, 44, 44)
$avatar = $src.Clone($rectAvatar, $src.PixelFormat)
$avatar.Save("c:\dev\xto\frontend\public\aditya.png", [System.Drawing.Imaging.ImageFormat]::Png)
$avatar.Dispose()

# 2. Hero Globe (clean without letters)
# Starts after "SEE TOMORROW'S ATTACKS TODAY" text at x: 790
$rectGlobe = New-Object System.Drawing.Rectangle(790, 75, 440, 195)
$globe = $src.Clone($rectGlobe, $src.PixelFormat)
$globe.Save("c:\dev\xto\frontend\public\hero_globe.png", [System.Drawing.Imaging.ImageFormat]::Png)
$globe.Dispose()

# 3. Environment Digital Twin 3D Scene
$rect3d = New-Object System.Drawing.Rectangle(260, 325, 930, 380)
$scene3d = $src.Clone($rect3d, $src.PixelFormat)
$scene3d.Save("c:\dev\xto\frontend\public\digital_twin_3d.png", [System.Drawing.Imaging.ImageFormat]::Png)
$scene3d.Dispose()

# 4. Blast Radius Spider Chart (clean diagram)
$rectBlast = New-Object System.Drawing.Rectangle(265, 785, 245, 155)
$blast = $src.Clone($rectBlast, $src.PixelFormat)
$blast.Save("c:\dev\xto\frontend\public\blast_radius_spider.png", [System.Drawing.Imaging.ImageFormat]::Png)
$blast.Dispose()

# 5. Control Effectiveness Split Chart (clean Before & After boxes)
$rectCtrl = New-Object System.Drawing.Rectangle(692, 785, 296, 150)
$ctrl = $src.Clone($rectCtrl, $src.PixelFormat)
$ctrl.Save("c:\dev\xto\frontend\public\control_effectiveness.png", [System.Drawing.Imaging.ImageFormat]::Png)
$ctrl.Dispose()

# 6. Active Simulation Radial Gauge
$rectGauge = New-Object System.Drawing.Rectangle(1225, 335, 120, 160)
$gauge = $src.Clone($rectGauge, $src.PixelFormat)
$gauge.Save("c:\dev\xto\frontend\public\simulation_gauge.png", [System.Drawing.Imaging.ImageFormat]::Png)
$gauge.Dispose()

$src.Dispose()
Write-Output "Refined assets cropped successfully."
