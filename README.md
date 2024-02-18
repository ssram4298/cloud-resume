# Jenkins and Apache Server Setup Guide

This guide will walk you through setting up an Amazon Linux AMI instance on a t2.micro, with a keypair, default network, and subnet. It includes security group configurations, connecting to the EC2 instance, installing Jenkins, creating a Jenkins pipeline, and configuring an Apache server.

## Step 1: EC2 Instance Setup
- Launch an Amazon Linux AMI instance with a t2.micro, keypair, default network, and subnet.
- Configure the security group with inbound rules for SSH (22), HTTP (80), HTTPS (443), and TCP (8080). Outbound rules should be set to allow all.

## Step 2: Jenkins Installation
1. Connect to the EC2 instance using EC2 Instance Connect.
2. Run the following commands:
    ```
    sudo yum update -y
    sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
    sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
    sudo yum upgrade
    sudo dnf install java-17-amazon-corretto -y
    sudo yum install jenkins -y
    sudo systemctl enable jenkins
    sudo systemctl start jenkins
    sudo systemctl status jenkins
    sudo yum install git -y
    ```

## Step 3: Jenkins Configuration
1. Configure Jenkins by going to http://<your_server_public_DNS>:8080.
2. Use the following command to retrieve the initial admin password: `sudo cat /var/lib/jenkins/secrets/initialAdminPassword`.
3. Paste the password in the unlock Jenkins section and create the first admin user.
4. Choose "Install recommended dependencies" to complete the Jenkins setup.

## Step 4: Jenkins Pipeline Creation
1. In Jenkins dashboard, create a new item → Free Style Project.
2. Select Git as source code management and provide the repository URL and credentials.
3. Add credentials using your email as the username and a generated GitHub personal access token as the password.
4. Choose the main branch in your GitHub repo for building.
5. In build triggers, select GitHub hook trigger for Git SCM polling.
6. In build steps, add an execute shell step with the command `git pull origin main`.
7. Your Jenkins pipeline is now created.

## Step 5: GitHub Webhook Setup
1. In your GitHub repository settings, go to Webhooks and add a new webhook.
2. Set the Payload URL to `http://your-instance-public-ip:8080/github-webhook/`.
3. Set Content Type as `application/json`.
4. Ensure you get a green tick mark next to your webhook.

## Step 6: Apache Server Installation
1. SSH into your EC2 instance.
2. Run the following commands:
    ```
    sudo yum update -y
    sudo yum install httpd -y
    sudo service httpd start
    sudo service httpd enable
    sudo service httpd status
    ```

## Step 7: Apache Server Configuration
1. Point Apache to serve the index.html in the Jenkins workspace:
    ```
    sudo chown -R ec2-user:ec2-user /var/lib/jenkins/workspace/your-project-name
    sudo nano /etc/httpd/conf/httpd.conf
    ```
2. Edit the path `/var/www/html` to your project folder path in the config file.
3. Restart Apache: `sudo service httpd restart`.
4. Verify Apache status: `sudo service httpd status`.

Now, your Jenkins pipeline should be triggered by GitHub webhooks, and Apache should serve your Jenkins workspace's index.html on your EC2 instance's public IP.