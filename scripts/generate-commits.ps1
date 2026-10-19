# PowerShell wrapper for generating commit history
param(
    [switch]$DryRun,
    [string]$Branch = "main"
)

$argsList = @()
if ($DryRun) {
    $argsList += "--dry-run"
}
if ($Branch) {
    $argsList += "--branch"
    $argsList += $Branch
}

node "$PSScriptRoot\generate-commit-history.js" $argsList

