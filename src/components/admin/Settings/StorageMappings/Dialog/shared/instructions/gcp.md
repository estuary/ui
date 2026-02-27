## Step 1: Copy the Service Account Email

Grant this service account access to your GCS bucket:

```
{{serviceAccount}}
```

## Step 2: Grant bucket permissions

Using `gsutil`, grant the admin role to the the service account using the following command:

```
{{gsutilCommand}}
```

Or in the Cloud Console, navigate to your bucket, click "Permissions", then "Grant Access", and add the service account with the "Storage Admin" role.
