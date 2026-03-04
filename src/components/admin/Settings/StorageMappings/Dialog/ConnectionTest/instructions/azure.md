# Step 1: Create the blob storage container

If you haven't already, [create the Azure blob storage container](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-portal#create-a-container)

# Step 2: Add the Estuary application to your Azure tenant

An Azure AD administrator must add Estuary's Azure application to your tenant. This creates a service principal that Estuary uses to access your storage.

[Click here to add the application](https://login.microsoftonline.com/{{accountTenantId}}/v2.0/adminconsent?client_id={{azureApplicationClientId}}&scope=https://storage.azure.com/.default)

# Step 3: Assign the Storage Blob Data Owner role

1. Navigate to your storage account **{{storageAccountName}}**
1. Open "Access Control (IAM)"
1. Click "Add role assignment"
1. In the "Role" tab, search for and select **Storage Blob Data Owner**
1. In the "Members" tab, search for and select **{{azureApplicationName}}**
1. Click **Review + assign**

> Note: Role assignments can take up to 10 minutes to propagate. If the connection test fails after assigning the role, wait a few minutes and retry.

For more help, see the [Azure docs](https://learn.microsoft.com/en-us/azure/role-based-access-control/role-assignments-portal)
