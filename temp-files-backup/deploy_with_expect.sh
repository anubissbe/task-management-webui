#!/bin/bash

# Direct deployment using expect
cat > /tmp/deploy.exp << 'EOF'
#!/usr/bin/expect -f

set timeout 300
spawn ssh -p 2222 Bert@192.168.1.24

expect {
    "password:" {
        send "JDU9xjn1ekx3rev_uma\r"
    }
    "yes/no" {
        send "yes\r"
        expect "password:"
        send "JDU9xjn1ekx3rev_uma\r"
    }
}

expect "$ "
send "cd /tmp\r"
expect "$ "
send "wget -q http://172.28.173.145:8080/projecthub-complete-bundle.tar.gz\r"
expect "$ "
send "sudo mkdir -p /volume1/docker/projecthub\r"
expect {
    "password for" {
        send "JDU9xjn1ekx3rev_uma\r"
        expect "$ "
    }
    "$ " {}
}
send "cd /volume1/docker/projecthub\r"
expect "$ "
send "sudo tar -xzf /tmp/projecthub-complete-bundle.tar.gz\r"
expect "$ "
send "sudo docker pull postgres:17-alpine\r"
expect "$ "
send "sudo docker pull node:22-alpine\r"
expect "$ "
send "sudo docker-compose -f docker-compose.synology-minimal.yml up -d\r"
expect "$ "
send "sudo docker-compose -f docker-compose.synology-minimal.yml ps\r"
expect "$ "
send "exit\r"
expect eof
EOF

chmod +x /tmp/deploy.exp
expect /tmp/deploy.exp
rm /tmp/deploy.exp