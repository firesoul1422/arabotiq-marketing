# Create .ssh directory if it doesn't exist
$sshDir = "$env:USERPROFILE\.ssh"
New-Item -ItemType Directory -Force -Path $sshDir

# Set the SSH key
$sshKey = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGN8dKTkUgGwm9uGzg5aKGi58hD/Pv7oAdwimpYjbAMt your_email@example.com'
Set-Content -Path "$sshDir\authorized_keys" -Value $sshKey

# Set appropriate permissions
$acl = Get-Acl $sshDir
$acl.SetAccessRuleProtection($true, $false)
# Remove all existing access rules
$acl.Access | ForEach-Object { $acl.RemoveAccessRule($_) }
# Add new restricted rule for current user
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule($env:USERNAME, "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.AddAccessRule($rule)
Set-Acl $sshDir $acl

# Set permissions for authorized_keys file
$keyFile = "$sshDir\authorized_keys"
$acl = Get-Acl $keyFile
$acl.SetAccessRuleProtection($true, $false)
# Remove all existing access rules
$acl.Access | ForEach-Object { $acl.RemoveAccessRule($_) }
# Add new restricted rule for current user
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule($env:USERNAME, "FullControl", "None", "None", "Allow")
$acl.AddAccessRule($rule)
Set-Acl $keyFile $acl

Write-Host "SSH key has been set up with appropriate permissions."

# Define server details
$serverIP = "172.236.20.100"
$sshPort = 22

# Test network connectivity first
Write-Host "Testing network connectivity to $serverIP..."
$pingTest = Test-Connection -ComputerName $serverIP -Count 2 -Quiet
if (-not $pingTest) {
    Write-Host "ERROR: Cannot ping $serverIP. Please check:"
    Write-Host "  - Your internet connection"
    Write-Host "  - Server firewall settings"
    Write-Host "  - Server is running and responsive"
    exit 1
}

# Test if SSH port is open
Write-Host "Testing SSH port availability..."
$portTest = Test-NetConnection -ComputerName $serverIP -Port $sshPort -WarningAction SilentlyContinue
if (-not $portTest.TcpTestSucceeded) {
    Write-Host "ERROR: Cannot connect to SSH port $sshPort on $serverIP. Please check:"
    Write-Host "  - SSH service is running on the server"
    Write-Host "  - Firewall allows SSH connections"
    Write-Host "  - Port $sshPort is correctly configured"
    exit 1
}

Write-Host "Network connectivity checks passed. Attempting SSH connection..."

# Test SSH connection with timeout
$sshProcess = Start-Process -FilePath "ssh" -ArgumentList "-v", "root@$serverIP" -PassThru -NoNewWindow
Start-Sleep -Seconds 10

if (-not $sshProcess.HasExited) {
    Write-Host "SSH connection established successfully."
} else {
    Write-Host "ERROR: SSH connection failed. Please check:"
    Write-Host "  - SSH key is correctly configured"
    Write-Host "  - Server's sshd configuration"
    Write-Host "  - User permissions on the server"
    exit 1
}