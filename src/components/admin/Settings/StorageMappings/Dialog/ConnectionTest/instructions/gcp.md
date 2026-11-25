# Step 1: Create the storage bucket

If you haven't already, [create the GCP bucket](https://cloud.google.com/storage/docs/creating-buckets)

- **Bucket name:** `{{bucket}}`

# Step 2: Grant bucket permissions

**Option A - Web UI:** In the Cloud Console, navigate to your bucket, click **Permissions**, then **Grant Access**. Paste this service account email into the **Principals** field:

```
{{gcpServiceAccountEmail}}
```

Finally, select the **Storage Editor**, **Storage Viewer**, and **Storage Object User** roles.

**Option B - CLI:** Execute these commands in your terminal:

```
gcloud storage buckets add-iam-policy-binding gs://{{bucket}} --member=serviceAccount:{{gcpServiceAccountEmail}} --role=roles/storage.editor
gcloud storage buckets add-iam-policy-binding gs://{{bucket}} --member=serviceAccount:{{gcpServiceAccountEmail}} --role=roles/storage.viewer
gcloud storage buckets add-iam-policy-binding gs://{{bucket}} --member=serviceAccount:{{gcpServiceAccountEmail}} --role=roles/storage.objectUser
```
