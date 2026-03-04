# Step 1: Create the storage bucket

If you haven't already, [create the S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html)

- **Bucket name:** `{{bucket}}`
- **Region:** `{{region}}`

# Step 2: Apply the bucket policy

## Option A - Web UI:

Navigate to the **Permissions** tab and paste this into your bucket policy.

```
{{bucketPolicy}}
```

> This policy includes all data planes that use this bucket, so existing connections will be preserved.

## Option B - CLI:

Paste the following into your terminal:

```
aws s3api put-bucket-policy --bucket {{bucket}} --policy '{{bucketPolicyCli}}'
```
