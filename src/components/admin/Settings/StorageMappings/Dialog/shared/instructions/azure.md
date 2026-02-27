## Step 1: Authorize the Estuary application in your Azure tenant

An Azure AD administrator must consent to the `{{azureApplicationName}}` application. This creates a service principal in your tenant that Estuary uses to access your storage.

[Authorize in Azure](https://login.microsoftonline.com/organizations/v2.0/adminconsent?client_id={{azureApplicationClientId}}&scope=https://storage.azure.com/.default)

## Step 2: Assign the Storage Blob Data Owner role

After consenting, grant the `Storage Blob Data Owner` role to `{{azureApplicationName}}` on your storage account.

1. Navigate to your storage account {{storageAccountNameFragment}}
1. Open "Access Control (IAM)"
1. Click "Add role assignment"
1. Select role: `Storage Blob Data Owner`
1. Search for and select `{{azureApplicationName}}`
1. Save

> Note: Azure RBAC role assignments can take up to 10 minutes to propagate. If the connection test fails after assigning the role, wait a few minutes and retry.

For more help, see the [Azure docs](https://learn.microsoft.com/en-us/azure/role-based-access-control/role-assignments-portal)

{{container_name}}
