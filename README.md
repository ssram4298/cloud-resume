# Project: AWS Web Development Journey

## HTML & CSS

I built a website using HTML, CSS, and JavaScript, featuring a basic layout with added functionality. Make sure to name your website’s main file as `index.html`.

## Static Website Deployment on AWS S3

In this step, I took my basic website code and deployed it to an S3 bucket on AWS. Ensure to enable ACLs during the S3 bucket creation.

## HTTPS with CloudFront

To use HTTPS for security, I utilized CloudFront. The steps for configuring a CloudFront distribution are:

1. Select your origin as your S3 bucket.
2. Set Origin Access Control (OAC) and select your S3 bucket.
3. Update the S3 policy to enable OAC (provided by CloudFront after distribution creation).
4. Select HTTPS only in the viewer protocol policy.
5. You can keep WAF enabled (Web Application Firewall), but be aware of associated costs. I chose to disable WAF during this step.
6. Leave everything else as default.
7. After creating the distribution, copy the S3 policy provided and paste it into the S3 bucket policy.

That's it! You now have a functioning website. Open the distribution domain name in a new tab to view your live website.

If you named your `index.html` file differently, update it in the default root object in your CloudFront settings.

## DNS Configuration with Route 53

Instead of using the CloudFront domain name, you need your own custom domain name. You can buy that domain from Route 53 on AWS. Here are the steps:

1. Go to Route 53 and create a hosted zone, providing a name like `example.com` or `example.net`. AWS shows the prices for available domains.
2. Choose a domain, check out, and wait for it to be provisioned. If you see your domain in hosted zones, you are good to go!
3. Verify your email.

### Setting up an Alternate Domain Name in CloudFront

1. Go to your CloudFront distribution and edit settings.
2. Add an alternate domain name like `resume.example.com`.
3. Go to custom SSL certificate and request a certificate.

#### Requesting an SSL Certificate

1. This takes you to AWS Certificate Manager (ACM), where you can request/view the status of your certificates.
2. The certificate needed will be a public certificate. Press next.
3. Put `*.example.com` in the fully qualified domain name to reuse the SSL certificate for other domains.
4. Leave everything as default (DNS validation and RSA2048 key algorithm).
5. After finishing, refresh the page. You should see that your certificate is pending validation. Click on it for more details.
6. In the domains section, select "Create records in Route 53." This takes you to Route 53. Click on create records. It may take a moment to update the certificate, but it will be issued.
7. Now, you can select the certificate in the CloudFront distribution.

### Creating a Route 53 Record

1. Come back to Route 53 and select create record.
2. Fill out the details. The record name should be whatever you put in CloudFront earlier (for example, `resume`).
3. Select alias and then select CloudFront distribution in route traffic dropdown. Choose your CloudFront distribution accordingly.
4. Leave others as default and create records. It might take a moment to update, but you should be able to see your website at `resume.example.com`.

## JavaScript, Database & API

We need to update the visitor counter for our website every time someone visits. We can do this using JavaScript on our website, DynamoDB to store the visitor count, and Lambda function to join both JavaScript and DynamoDB.

### Setting up DynamoDB

Create a table with a primary key (I used ID). After creating the table, create a column to store views and create an item with ID and views as 0.

### Setting up Lambda Function

1. Create a function with a `Python` runtime and use the provided code.
2. In advanced settings, enable function URL as we will use this URL in JavaScript to invoke this Lambda function.
3. Grant Lambda function permission to access DynamoDB. Go to Lambda function’s configuration and permissions in the sidebar.
4. A role is assigned for our Lambda function. Go into the role, which should take us to IAM, and give it DynamoDBFullAccess permission policy.
5. This enables the Lambda function to access the DynamoDB table and has permissions to read and write into it.

```python
import json
import boto3

db = boto3.resource('dynamodb')
table = db.Table('cloudresume')

def lambda_handler(event, context):
    response = table.get_item(Key={
        'ID': 1
    })

    views = response['Item']['views']

    views += 1
    print(views)

    response = table.put_item(Item={
        'ID': 1,
        'views': views
    })

    return views
```

### Setting up JavaScript

Display the views of the page in the footer. Ensure you have an ID or class set up for the tag you want to show views for.
The JavaScript code calls the function URL of the Lambda function and gets the view count from DynamoDB, increments that count, and updates it into the DynamoDB table.
```jsx
// View Counter

const counter =  document.querySelector(".view-counter");
async function updateCounter() {
  let response = await fetch(lambda-function-url);
  let data = await response.json();
  counter.innerHTML = `Built with ❤️ | Visitors: ${data}`;
}

updateCounter();
```
With this setup, your website is ready to display views.

## Source Control & CI/CD
After all the configurations, it would be cumbersome to manually upload changes to S3. Hence, I set up source control using GitHub and implemented CI/CD using GitHub Actions to automatically push updated code into S3.

I won't list out the steps for source control here, assuming you have already set up a repository and pushed your work into that repo. We'll start by adding folders and a new file in our working directory. The folders are .github/workflows which host our YAML file. We can name this file anything, for example, cicd.yml. Below is the content of the YAML file:

```yaml
name: Upload Website

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - uses: jakejarvis/s3-sync-action@master
        with:
          args: --acl private --follow-symlinks --delete
        env:
          AWS_S3_BUCKET: ${{ secrets.AWS_S3_BUCKET }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: 'us-east-1'   # optional: defaults to us-east-1
```
It's always best to create an IAM user that has S3 access and give its access keys instead of using your main account keys.

1. Go to create user, attach policies directly, attach S3 full access, and create a new user.
2. Go to security credentials and create new access keys and save them.
3. Go to the GitHub repository, go to settings, secrets and variables, actions, and add a new repository secret. Copy the 3 secrets in the code about and add them individually.
4. The reason why we enabled ACLs while creating the S3 bucket is to let GitHub Actions push into it using the access keys that we gave it.
5. We can now push the folder that we created, and we should see a workflow running in GitHub Actions. With all the permissions granted, the workflow should pass and upload the code to the S3 bucket.

With all this done, whenever we make changes and push them into GitHub, our website at `resume.example.com` should be updated.