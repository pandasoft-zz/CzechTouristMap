#######################################################
# Build Mapsforge map theme XML from XSLT templates
#
# Usage:
#   .\build-theme.ps1 [STYLE]
#   STYLE defaults to CzechTouristMap
#
# Output: themes\STYLE.xml
#
# Runtime detection order:
#   1. xsltproc native
#   2. podman
#   3. docker
#
########################################################

param(
    [string]$Style = "CzechTouristMap"
)

$ErrorActionPreference = "Stop"

$ProjectDir = $PSScriptRoot
$OutputFile = Join-Path $ProjectDir "themes\$Style.xml"
$XsltFile   = Join-Path $ProjectDir "src\styles\$Style\$Style.xslt"
$ImageName  = "czechtouristmap-style"
$Dockerfile = Join-Path $ProjectDir "src\Dockerfile.style"
$SrcDir     = Join-Path $ProjectDir "src"

# ── Detect runtime ────────────────────────────────────────────────────────────

function Find-Runtime {
    if (Get-Command xsltproc -ErrorAction SilentlyContinue) {
        return "native"
    }

    if (Get-Command podman -ErrorAction SilentlyContinue) {
        return "podman"
    }

    if (Get-Command docker -ErrorAction SilentlyContinue) {
        return "docker"
    }

    return "none"
}

function Invoke-Container {
    param([string]$Exe)

    Write-Host "==> Building image with $Exe..."
    # Pipe build output through Out-Host so it goes directly to the terminal, never captured.
    # Docker BuildKit in non-TTY mode (VS Code task panel) writes [+] Building... to stdout;
    # Out-Host bypasses the pipeline so it cannot contaminate the captured XML below.
    & $Exe build -f $Dockerfile -t $ImageName $SrcDir 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "Container build failed" }

    Write-Host "==> Running XSLT transform..."
    # Capture as array of lines, then rejoin with LF.
    # PowerShell captures external command output as string[], not a single string.
    [string[]]$lines = & $Exe run --rm -e "STYLE=$Style" $ImageName
    if ($LASTEXITCODE -ne 0) { throw "Container run failed" }

    return ($lines -join "`n")
}

# ── Main ──────────────────────────────────────────────────────────────────────

$runtime = Find-Runtime
Write-Host "==> Building theme: $Style  (runtime: $runtime)"

switch ($runtime) {
    "native" {
        Write-Host "==> Running xsltproc natively..."
        [string[]]$lines = xsltproc $XsltFile
        if ($LASTEXITCODE -ne 0) { throw "xsltproc failed" }
        $xml = $lines -join "`n"
        [System.IO.File]::WriteAllText($OutputFile, $xml)
    }

    "podman" {
        $xml = Invoke-Container "podman"
        [System.IO.File]::WriteAllText($OutputFile, $xml)
    }

    "docker" {
        $xml = Invoke-Container "docker"
        [System.IO.File]::WriteAllText($OutputFile, $xml)
    }

    "none" {
        Write-Error "No supported runtime found. Install xsltproc, podman, or docker."
        exit 1
    }
}

$size = (Get-Item $OutputFile).Length
Write-Host "==> Output: $OutputFile ($size bytes)"
