# Server connection details
$SERVER_IP = "194.62.98.197"
$SSH_KEY_PATH = "~/.ssh/id_ed25519"
$SERVER_USER = "root"
$APP_DIR = "/app"

# Check and create .ssh directory with proper permissions
$SSH_DIR = "$HOME/.ssh"
if (-not (Test-Path $SSH_DIR)) {
    New-Item -ItemType Directory -Path $SSH_DIR
    $acl = Get-Acl $SSH_DIR
    $acl.SetAccessRuleProtection($true, $false)
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($env:USERNAME, "FullControl", "Allow")
    $acl.AddAccessRule($rule)
    Set-Acl $SSH_DIR $acl
}

# Create known_hosts file if it doesn't exist
$KNOWN_HOSTS = "$SSH_DIR/known_hosts"
if (-not (Test-Path $KNOWN_HOSTS)) {
    New-Item -ItemType File -Path $KNOWN_HOSTS
    $acl = Get-Acl $KNOWN_HOSTS
    $acl.SetAccessRuleProtection($true, $false)
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($env:USERNAME, "FullControl", "Allow")
    $acl.AddAccessRule($rule)
    Set-Acl $KNOWN_HOSTS $acl
}

# Check if SSH key exists
if (-not (Test-Path $SSH_KEY_PATH)) {
    Write-Host "SSH key not found at $SSH_KEY_PATH. Please generate an SSH key pair first."
    exit 1
}

# Test SSH connection
Write-Host "Testing SSH connection..."
try {
    ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_IP}" "echo 'SSH connection successful'"
} catch {
    Write-Host "Failed to establish SSH connection. Please check your SSH key and server details."
    exit 1
}

# Transfer server initialization script
Write-Host "Transferring server initialization script..."
scp -i $SSH_KEY_PATH .\server_init.sh "${SERVER_USER}@${SERVER_IP}:/tmp/"

# Make the script executable and run it
Write-Host "Running server initialization script..."
ssh -i $SSH_KEY_PATH "${SERVER_USER}@${SERVER_IP}" "chmod +x /tmp/server_init.sh && sudo /tmp/server_init.sh"

Write-Host "Server initialization completed!"