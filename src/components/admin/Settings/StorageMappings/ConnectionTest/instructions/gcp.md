# Step 1: Create the storage bucket

If you haven't already, [create the GCP bucket](https://cloud.google.com/storage/docs/creating-buckets)

- **Bucket name:** `{{bucket}}`

# Step 2: Grant bucket permissions

**Option A - Web UI:** In the Cloud Console, navigate to your bucket, click **Permissions**, then **Grant Access**. Paste this service account email into the **Principals** field:

```
{{gcpServiceAccountEmail}}
```

Finally, select the **Storage Admin** role.

**Option B - CLI:** Execute this command in your terminal:

```
gsutil iam ch serviceAccount:{{gcpServiceAccountEmail}}:admin gs://{{bucket}}
```
