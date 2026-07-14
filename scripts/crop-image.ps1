param(
  [string]$Source,
  [string]$Dest,
  [int]$X = 0,
  [int]$Y = 0,
  [int]$Width,
  [int]$Height
)

Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Image]::FromFile($Source)
if (-not $Width -or $Width -le 0) { $Width = $src.Width - $X }
if (-not $Height -or $Height -le 0) { $Height = $src.Height - $Y }
$Width = [Math]::Min($Width, $src.Width - $X)
$Height = [Math]::Min($Height, $src.Height - $Y)

$rect = New-Object System.Drawing.Rectangle $X, $Y, $Width, $Height
$bmp = $src.Clone($rect, $src.PixelFormat)

$dir = Split-Path $Dest -Parent
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
$bmp.Save($Dest, [System.Drawing.Imaging.ImageFormat]::Png)

$bmp.Dispose(); $src.Dispose()
Write-Output "Crop saved: $Dest (${Width}x${Height})"
