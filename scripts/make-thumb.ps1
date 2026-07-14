param(
  [string]$Source,
  [string]$Dest,
  [int]$CropHeight = 420,
  [int]$Width = 640,
  [int]$Height = 360
)

Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Image]::FromFile($Source)
$cropH = [Math]::Min($CropHeight, $src.Height)
$bmp = New-Object System.Drawing.Bitmap $src.Width, $cropH
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($src, 0, 0, $src.Width, $cropH)

$thumb = New-Object System.Drawing.Bitmap $Width, $Height
$g2 = [System.Drawing.Graphics]::FromImage($thumb)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g2.DrawImage($bmp, 0, 0, $Width, $Height)

$dir = Split-Path $Dest -Parent
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
$thumb.Save($Dest, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose(); $g2.Dispose(); $bmp.Dispose(); $thumb.Dispose(); $src.Dispose()
Write-Output "Thumb saved: $Dest"
