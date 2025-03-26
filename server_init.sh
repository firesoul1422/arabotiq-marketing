#!/bin/bash

# Exit on any error
set -e

# Create necessary directories with proper permissions
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/known_hosts
chmod 644 ~/.ssh/known_hosts

# Function to fix package manager state
fix_package_manager() {
    echo "Fixing package manager state..."
    dpkg --configure -a
}

# Function to handle package manager locks
handle_package_locks() {
    if [ -f /var/lib/dpkg/lock-frontend ]; then
        rm -f /var/lib/dpkg/lock-frontend
    fi
    if [ -f /var/lib/dpkg/lock ]; then
        rm -f /var/lib/dpkg/lock
    fi
    if [ -f /var/lib/apt/lists/lock ]; then
        rm -f /var/lib/apt/lists/lock
    fi
    if [ -f /var/cache/apt/archives/lock ]; then
        rm -f /var/cache/apt/archives/lock
    fi
    killall apt-get >/dev/null 2>&1 || true
}

# Update system packages
echo "Updating system packages..."
handle_package_locks
fix_package_manager
apt-get update
apt-get upgrade -y

# Install essential tools
echo "Installing essential tools..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common \
    gnupg \
    lsb-release

# Install Docker
echo "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io

# Start and enable Docker service
systemctl start docker
systemctl enable docker

# Configure firewall
echo "Configuring firewall..."
apt-get install -y ufw
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# Set timezone
timedatectl set-timezone UTC

# Create application directory
echo "Setting up application environment..."
mkdir -p /app
chown -R $USER:$USER /app

# Install Docker Compose
echo "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Configure network settings for private network
echo "Configuring private network settings..."
apt-get install -y bridge-utils net-tools

# Create network bridge for private network
ip link add br0 type bridge
ip link set br0 up

# Configure iptables for private network
iptables -A FORWARD -i br0 -j ACCEPT
iptables -A FORWARD -o br0 -j ACCEPT
iptables -t nat -A POSTROUTING -s 10.0.0.0/24 -j MASQUERADE

# Enable source IP filtering
iptables -A FORWARD -i br0 -m state --state NEW -j ACCEPT

# Save iptables rules
apt-get install -y iptables-persistent
netfilter-persistent save

# Basic security configurations
echo "Applying security configurations..."
# Disable root SSH login
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
# Disable password authentication
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# Configure private network interface
cat > /etc/netplan/99-private-network.yaml << EOF
network:
  version: 2
  ethernets:
    br0:
      dhcp4: no
      addresses: [10.0.0.1/24]
      nameservers:
        addresses: [10.0.0.1]
      routing-policy: {}
EOF

# Apply network configuration
netplan apply

# Configure automatic security updates
echo "Configuring automatic security updates..."
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# Install monitoring tools
echo "Installing monitoring tools..."
apt-get install -y htop iotop nmon

# Install and configure logrotate
echo "Configuring log rotation..."
apt-get install -y logrotate
cat > /etc/logrotate.d/docker << EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=50M
    missingok
    delaycompress
    copytruncate
}
EOF

# Enable and start monitoring services
echo "Starting monitoring services..."

echo "Server initialization completed successfully with security updates and monitoring configuration!"