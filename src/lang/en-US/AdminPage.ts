import { CommonMessages } from './CommonMessages';
import { CTAs } from './CTAs';
import { Errors } from './Errors';

export const AdminPage: Record<string, string> = {
    'admin.header': `Administration`,
    'admin.roles.message': `These are all the ${CommonMessages['terms.permissions']} that are currently provisioned. An administrator can update them in the {docLink}.`,
    'admin.roles.message.docLink': `authorization settings`,
    'admin.roles.message.docPath': `https://go.estuary.dev/provision`,

    'admin.cli_api.header': `Programmatic Access to Flow`,
    'admin.cli_api.message': `Use Refresh and Access tokens to connect to Flow programmatically.`,
    'admin.cli_api.accessToken': `Access Token`,
    'admin.cli_api.accessToken.message': `Access tokens enable authentication using flowctl.`,
    'admin.cli_api.refreshToken': `Refresh Token`,
    'admin.cli_api.refreshToken.message': `Refresh tokens enable programmatic access to most services including the Kafka compatible API “dekaf”.`,
    'admin.cli_api.refreshToken.cta.generate': `Generate Token`,
    'admin.cli_api.refreshToken.table.noContent.header': `No refresh tokens found.`,
    'admin.cli_api.refreshToken.table.noContent.message': `To create a refresh token, click "Generate Token" above.`,
    'admin.cli_api.refreshToken.table.filterLabel': `Filter by Description`,
    'admin.cli_api.refreshToken.table.label.uses': `Used {count} {count, plural, one {time} other {times}}`,
    'admin.cli_api.refreshToken.dialog.header': `Generate Refresh Token`,
    'admin.cli_api.refreshToken.dialog.label': `What’s this token for?`,
    'admin.cli_api.refreshToken.dialog.alert.copyToken': `Make sure to copy your refresh token now. You won't be able to see it again!`,
    'admin.cli_api.refreshToken.dialog.alert.tokenEncodingFailed': `An issue was encountered displaying your token. Please generate a new token.`,

    'admin.billing.header': `Billing`,
    'admin.billing.message.freeTier': `The free tier lets you try Flow with up to 2 tasks and 10GB per month without entering a credit card. Usage beyond these limits automatically starts a 30 day free trial.`,
    'admin.billing.message.paidTier': `Cloud tier.`,
    'admin.billing.error.details.header': `There was a network issue.`,
    'admin.billing.error.details.message': `There was an error fetching your billing details. ${Errors['error.tryAgain']}`,
    'admin.billing.error.paymentMethodsError': `There was an error connecting with our payment provider. Please try again later.`,
    'admin.billing.error.undefinedPricingTier': `An issue was encountered gathering information about the pricing tier associated with this tenant. Please {docLink}.`,
    'admin.billing.error.undefinedPricingTier.docLink': `${CTAs['cta.support']}`,
    'admin.billing.error.undefinedPricingTier.docPath': `${CommonMessages['support.email']}`,
    'admin.billing.label.tiers': `Pricing Tier`,
    'admin.billing.label.lineItems': `Your bill for:`,
    'admin.billing.label.lineItems.empty': `No bill to display`,
    'admin.billing.label.lineItems.loading': `Loading your bill`,
    'admin.billing.tier.free': `Free`,
    'admin.billing.tier.personal': `Cloud`,
    'admin.billing.tier.enterprise': `Enterprise`,
    'admin.billing.graph.usageByMonth.header': `Usage by Month`,
    'admin.billing.graph.usageByMonth.dataFormatter': `{value} GB`,
    'admin.billing.graph.usageByMonth.hoursFormatter': `{value} hours`,
    'admin.billing.graph.taskHoursByMonth.header': `Task Hours by Month`,
    'admin.billing.graph.taskHoursByMonth.formatValue': `{taskUsage} {taskUsage, plural, one {Hour} other {Hours}}`,
    'admin.billing.graph.dataByTask.header': `Data Volume by Task`,
    'admin.billing.graph.dataByTask.tooltip': `This graph displays the three, largest data processing tasks over the set interval.`,
    'admin.billing.table.history.header': `Recent History`,
    'admin.billing.table.history.label.dataVolume': `Data Volume`,
    'admin.billing.table.history.label.details': `Pricing Tier`,
    'admin.billing.table.history.label.date_start': `Start Date`,
    'admin.billing.table.history.label.date_end': `End Date`,
    'admin.billing.table.history.label.tasks': `Task Usage`,
    'admin.billing.table.history.label.totalCost': `Total Cost`,
    'admin.billing.table.history.tooltip.date_start': `This billing period began on {timestamp}`,
    'admin.billing.table.history.tooltip.date_end': `This billing period ended on {timestamp}`,
    'admin.billing.table.history.tooltip.dataVolume': `GB of data processed by tasks`,
    'admin.billing.table.history.emptyTableDefault.header': `No information found.`,
    'admin.billing.table.history.emptyTableDefault.message': `We couldn't find any billing information on file. Only administrators of a tenant are able to review billing information.`,

    'admin.billing.table.line_items.title': `Invoice Details`,
    'admin.billing.table.line_items.label.description': `Description`,
    'admin.billing.table.line_items.label.count': `Quantity`,
    'admin.billing.table.line_items.label.rate': `Unit Price`,
    'admin.billing.table.line_items.label.subtotal': `Subtotal`,
    'admin.billing.table.line_items.label.total': `Total Due`,
    'admin.billing.table.line_items.emptyTableDefault.header': `No information found.`,
    'admin.billing.table.line_items.emptyTableDefault.message': `We couldn't find any billing information on file. Only administrators of a tenant are able to review billing information.`,
    'admin.billing.table.line_items.tooltip.download_pdf': `Download invoice PDF`,
    'admin.billing.table.line_items.tooltip.pay_invoice': `Pay Invoice`,
    'admin.billing.table.line_items.tooltip.invoice_paid': `Invoice Paid`,

    'admin.billing.paymentMethods.header': `Payment Information`,
    'admin.billing.paymentMethods.description': `Enter your payment information.  You won’t be charged until your account usage exceeds free tier limits.`,
    'admin.billing.paymentMethods.cta.addPaymentMethod': `Add Payment Method`,
    'admin.billing.paymentMethods.cta.addPaymentMethod.error': `There was an issue attempting to get a token from Stripe. You cannot currently add a payment method. ${Errors['error.tryAgain']}`,
    'admin.billing.paymentMethods.table.label.cardType': `Type`,
    'admin.billing.paymentMethods.table.label.name': `Name`,
    'admin.billing.paymentMethods.table.label.lastFour': `Last 4 Digits`,
    'admin.billing.paymentMethods.table.label.details': `Details`,
    'admin.billing.paymentMethods.table.label.primary': `Primary`,
    'admin.billing.paymentMethods.table.label.actions': `Actions`,
    'admin.billing.paymentMethods.table.emptyTableDefault.message': `No payment methods available.`,
    'admin.billing.addPaymentMethods.title': `Add a payment method`,
    'admin.billing.addPaymentMethods.stripeLoadError': `Unable to load the forms from Stripe. ${Errors['error.tryAgain']}`,

    'admin.grants.confirmation.alert': `Access to all items will be revoked and this action cannot be undone. Please review the list to continue.`,

    'admin.users.cta.prefixInvitation': `Manage Invitations`,
    'admin.users.prefixInvitation.header': `Manage Invitations`,
    'admin.users.prefixInvitation.message': `This is a placeholder for a description.`,
    'admin.users.prefixInvitation.label.capability': `Capability`,
    'admin.users.prefixInvitation.label.type': `Type`,
    'admin.users.prefixInvitation.cta.generateLink': `Generate Invitation`,
    'admin.users.confirmation.listItem': `{identifier} with {capability} access.`,

    'admin.prefix.cta.issueGrant': `Grant Access`,
    'admin.prefix.issueGrant.header': `Share Data`,
    'admin.prefix.issueGrant.message': `This is a placeholder for a description.`,
    'admin.prefix.issueGrant.label.capability': `Capability`,
    'admin.prefix.issueGrant.label.sharedPrefix': `Shared Prefix`,
    'admin.prefix.issueGrant.label.sharedWith': `Shared With`,
    'admin.prefix.issueGrant.cta.generateGrant': `Grant Access`,
    'admin.prefix.issueGrant.notification.success.title': `Grant Created Successfully`,
    'admin.prefix.issueGrant.notification.success.message': `{objectRole} has been shared with {subjectRole}.`,
    'admin.prefix.issueGrant.error.invalidPrefix': `The value entered in the Shared Prefix text field is not an extension of an existing prefix.`,
    'admin.prefix.confirmation.listItem': `{subjectRole} having {capability} over {objectRole}.`,
    'admin.prefix.issueGrant.error.duplicatePrefix': `The requested access has already been provisioned.`,

    'admin.alerts.header': `Organization Notifications`,
    'admin.alerts.table.aria.label': `Organization Notifications Table`,
    'admin.alerts.cta.addAlertMethod': `Configure Notifications`,
    'admin.alerts.dialog.description': `Choose where you'd like notifications to be sent. To add an email address, select from the list of admin user emails or enter custom email addresses as a comma separated list.`,
    'admin.alerts.dialog.emailSelector.inputError': `One or more emails are not formatted properly.`,
    'admin.alerts.dialog.generate.header': `Configure Notification Methods`,
    'admin.alerts.dialog.update.header': `Update Notification Methods`,
    'admin.alerts.table.filterLabel': `Filter by Prefix or Email`,
    'admin.alerts.table.noContent.header': `No subscriptions found.`,
    'admin.alerts.table.noContent.message': `To begin receiving email notifications for a prefix you admin, click "Configure Notifications" above to create a subscription.`,
    'admin.alerts.table.label.alertMethod': `Notification Method`,

    'admin.tabs.users': `Account Access`,
    'admin.tabs.connectors': `Connectors`,
    'admin.tabs.api': `CLI-API`,
    'admin.tabs.billing': `Billing`,
    'admin.tabs.settings': `Settings`,

    // Storage Mappings
    'storageMappings.header': `Cloud Storage`,
    'storageMappingsTable.title': `Storage Locations`,
    'storageMappingsTable.table.aria.label': `Storage Locations Table`,
    'storageMappingsTable.filterLabel': `Filter by Prefix`,
    'storageMappingsTable.message1': `No results found.`,
    'storageMappingsTable.message2': `We couldn't find any results matching your search. Please try a different filter.`,
    'storageMappings.prefix.description': `The Flow prefix you want to configure`,
    'storageMappings.provider.label': `Provider`,
    'storageMappings.provider.description': `The provider (ex: S3, GCP) you are using`,
    'storageMappings.bucket.label': `Bucket`,
    'storageMappings.bucket.description': `The name of the bucket you have setup to store data in.`,
    'storageMappings.lastUpdated.label': `Last Updated`,
    'storageMappings.message': `Create a Storage Mapping to govern where your data is stored. The first storage mapping is the one and only location that data is saved.`,

    'storageMappings.configureStorage.label': `Configure Storage`,
    'storageMappings.dialog.generate.description': `Choose where you'd like {tenant} data to be stored. This location will be used for all future write operations.`,
    'storageMappings.dialog.generate.alert.keyPrefix': `Your tenant, {tenant}, will be used to prefix the keys written to the specified storage location.`,
    'storageMappings.dialog.generate.providerOption.AZURE': `Azure Object Storage Service`,
    'storageMappings.dialog.generate.providerOption.CUSTOM': `An S3-compatible Endpoint`,
    'storageMappings.dialog.generate.providerOption.GCS': `Google Cloud Storage`,
    'storageMappings.dialog.generate.providerOption.S3': `Amazon Simple Storage Service`,
    'storageMappings.dialog.generate.logsHeader': `Please wait while we save and apply your storage mapping.`,
    'storageMappings.dialog.generate.error.republicationFailed': `There was an error republishing the entities in your system. Please try again.`,
    'storageMappings.dialog.generate.error.unableToFetchLogs': `There was an issue fetching the logs when applying the new storage mapping. Please contact support to confirm that your system has been updated accordingly.`,

    // Access Grants
    'accessGrantsTable.header': `Captures`,
    'accessGrantsTable.users.title': `Organization Membership`,
    'accessGrantsTable.users.table.aria.label': `Organization Membership Table`,
    'accessGrantsTable.prefixes.title': `Data Sharing`,
    'accessGrantsTable.prefixes.table.aria.label': `Data Sharing Table`,
    'accessGrantsTable.users.filterLabel': `Filter User or Object`,
    'accessGrantsTable.prefixes.filterLabel': `Filter Prefixes`,
    'accessGrants.message1': `No results found.`,
    'accessGrants.message2': `We couldn't find any results matching your search. Please try a different filter.`,

    'accessGrants.table.accessLinks.title': `Active Invitations`,
    'accessGrants.table.accessLinks.cta.generate': `Create Links`,
    'accessGrants.table.accessLinks.header.noData': `No active invitations found.`,
    'accessGrants.table.accessLinks.message.noData': `To create an invitation, click the "Generate Invitation" button above. Invitations will be listed here while they are live.`,
    'accessGrants.table.accessLinks.label.filter': `Filter Prefix or Capability`,
    'accessGrants.table.accessLinks.label.provisioningPrefix': `Provisioner`,
    'accessGrants.table.accessLinks.label.grantedPrefix': `Prefix`,
    'accessGrants.table.accessLinks.label.capability': `Capability`,
    'accessGrants.table.accessLinks.label.url': `URL`,
    'accessGrants.table.accessLinks.label.lastUpdated': `Last Updated`,
    'accessGrants.table.accessLinks.label.actions': `Actions`,
    'accessGrants.table.accessLinks.delete.confirm': `All items will be disabled and this action cannot be undone. Please review the list to continue.`,
};
