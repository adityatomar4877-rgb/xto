Add-Type -AssemblyName System.Drawing
$imgPath = "c:\dev\xto\255c889a-368d-4f4f-a497-ab4be6e6a052.png"
$src = [System.Drawing.Bitmap]::FromFile($imgPath)
Write-Output "Image loaded successfully: $($src.Width)x$($src.Height)"
$src.Dispose()
