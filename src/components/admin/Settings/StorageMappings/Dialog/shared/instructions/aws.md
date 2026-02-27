## Step 1: Copy the IAM Role ARN

Add this ARN to your S3 bucket policy or IAM role trust relationship:

```
{{iamArn}}
```

## Step 2: Apply this bucket policy

Add this policy to your S3 bucket to grant the necessary permissions:

```
{{bucketPolicy}}
```
