# swap-docx-image.ps1 — replace one embedded image inside a .docx by content hash
param(
  [string]$Docx = "F:\software_project\Software_Project_14\TwinMOS_Corporate_Website\Technical_document\TwinMOS_Platform_Technical_Documentation.docx",
  [string]$OldPng = "F:\software_project\Software_Project_14\TwinMOS_Corporate_Website\Technical_document\screenshots\admin_content_old502.png",
  [string]$NewPng = "F:\software_project\Software_Project_14\TwinMOS_Corporate_Website\Technical_document\screenshots\admin_content.png"
)
$ErrorActionPreference = "Stop"

Copy-Item $Docx "$Docx.bak-image-swap" -Force

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-StreamHash($entry) {
  $sha = [System.Security.Cryptography.SHA256]::Create()
  $s = $entry.Open()
  try {
    $ms = New-Object System.IO.MemoryStream
    $s.CopyTo($ms)
    return [BitConverter]::ToString($sha.ComputeHash($ms.ToArray()))
  } finally { $ms.Dispose(); $s.Dispose(); $sha.Dispose() }
}

$oldHash = [BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.IO.File]::ReadAllBytes($OldPng)))
$newBytes = [System.IO.File]::ReadAllBytes($NewPng)

$zip = [System.IO.Compression.ZipFile]::Open($Docx, [System.IO.Compression.ZipArchiveMode]::Update)
try {
  $targets = @($zip.Entries | Where-Object { $_.FullName -like "word/media/*" })
  $match = $null
  foreach ($e in $targets) {
    if ((Get-StreamHash $e) -eq $oldHash) { $match = $e; break }
  }
  if (-not $match) { Write-Output "NOMATCH media_entries=$($targets.Count)"; exit 2 }
  $name = $match.FullName
  Write-Output ("match=" + $name + " old_size=" + $match.Length)
  $match.Delete()
  $new = $zip.CreateEntry($name, [System.IO.Compression.CompressionLevel]::Optimal)
  $ws = $new.Open()
  try { $ws.Write($newBytes, 0, $newBytes.Length) } finally { $ws.Dispose() }
  Write-Output ("replaced_with new_size=" + $newBytes.Length)
} finally { $zip.Dispose() }
Write-Output "OK"
