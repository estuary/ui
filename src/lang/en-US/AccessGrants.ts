import { CommonMessages } from 'src/lang/en-US/CommonMessages';

const prefixes = {
    finalEmail: `You will have no ability to`,
    email: `The user will not be able to`,
    ownEmail: `You will not be able to`,
    ownTenant: `The tenant will not be able to`,
    support: `Estuary Support staff will no longer be able to`,
    tenant: `This will remove one tenant's ability to`,
};

const suffixes = {
    finalEmail: `anything in the app.`,
};

const impact = `Data flows may fail!`;

export const AccessGrants: Record<string, string> = {
    'accessGrantsTable.header': `Captures`,
    'accessGrantsTable.users.title': `Organization Membership`,
    'accessGrantsTable.users.table.aria.label': `Organization Membership Table`,
    'accessGrantsTable.prefixes.title': `Data Sharing`,
    'accessGrantsTable.prefixes.table.aria.label': `Data Sharing Table`,
    'accessGrantsTable.users.filterLabel': `Filter User or Object`,
    'accessGrantsTable.prefixes.filterLabel': `Filter Prefixes`,
    'accessGrants.message1': `No results found.`,
    'accessGrants.message2': `We couldn't find any results matching your search. Please try a different filter.`,

    'accessGrants.table.accessLinks.title': `Active Invite Links`,
    'accessGrants.table.accessLinks.cta.generate': `Create Links`,
    'accessGrants.table.accessLinks.header.noData': `No active invitations found.`,
    'accessGrants.table.accessLinks.message.noData': `To create an invitation, click the "Create Invite Link" button above. Invitations will be listed here while they are live.`,
    'accessGrants.table.accessLinks.label.filter': `Filter Prefix or Capability`,
    'accessGrants.table.accessLinks.label.provisioningPrefix': `Provisioner`,
    'accessGrants.table.accessLinks.label.grantedPrefix': `Prefix`,
    'accessGrants.table.accessLinks.label.capability': `Capability`,
    'accessGrants.table.accessLinks.label.lastUpdated': `Last Updated`,
    'accessGrants.table.accessLinks.label.actions': `Actions`,
    'accessGrants.table.accessLinks.delete.confirm': `All items will be disabled and this action cannot be undone. Please review the list to continue.`,

    'accessGrants.actions.extra.confirmation.whatThatMeans': `What will happen?`,
    'accessGrants.actions.extra.confirmation.whatIsChanging': `What is changing?`,
    'accessGrants.actions.extra.confirmation.whatIsChanging.removing': `removing`,
    'accessGrants.actions.extra.confirmation.whatIsChanging.access': `access for`,

    'accessGrants.actions.extra.confirmation.title': `Extra Attention Required`,
    'accessGrants.actions.extra.confirmation.instructions': `These changes may cause your data flows to fail. Please reach out to {docLink} if you have questions.`,
    'accessGrants.actions.extra.confirmation.instructions.docLink': `support@estuary.dev`,
    'accessGrants.actions.extra.confirmation.instructions.docPath': `${CommonMessages['support.email']}`,

    // There are dynamically built up in useAccessGrantRemovalDescriptions
    // Allowed values are listed in the hook with the type MessageIdWhereVals

    // When a user removes public data plane at all from a tenant
    'accessGrants.descriptions.removing.dataPlane.tenant': `The tenant will no longer be able to write to the public dataplane. ${impact}`,

    // When a user removes another user's email
    'accessGrants.descriptions.removing.admin.email': `${prefixes.email} add/remove users or manage settings.`,
    'accessGrants.descriptions.removing.write.email': `${prefixes.email} make new entities on the tenant.`,
    'accessGrants.descriptions.removing.read.email': `${prefixes.email} see anything on the tenant.`,

    // When a user removes their own email and it is the last one they have
    //  We do not check if they are removing their final "write"
    'accessGrants.descriptions.removing.admin.finalEmail': `${prefixes.finalEmail} create or manage ${suffixes.finalEmail}`,
    'accessGrants.descriptions.removing.read.finalEmail': `${prefixes.finalEmail} view ${suffixes.finalEmail}`,

    // When a user removes their own email
    'accessGrants.descriptions.removing.admin.ownEmail': `${prefixes.ownEmail} add/remove users or manage settings.`,
    'accessGrants.descriptions.removing.write.ownEmail': `${prefixes.ownEmail} create new entities in this tenant.`,
    'accessGrants.descriptions.removing.read.ownEmail': `${prefixes.ownEmail} view entities on the tenant.`,

    // When a user removes one tenant's access to self
    'accessGrants.descriptions.removing.admin.ownTenant': `${prefixes.ownTenant} manage itself. ${impact}`,
    'accessGrants.descriptions.removing.write.ownTenant': `${prefixes.ownTenant} create anything in itself. ${impact}`,
    'accessGrants.descriptions.removing.read.ownTenant': `${prefixes.ownTenant} read from itself. ${impact}`,

    // When a user is removing support access
    'accessGrants.descriptions.removing.admin.support': `${prefixes.support} help manage the tenant.`,
    'accessGrants.descriptions.removing.write.support': `${prefixes.support} make new entities on your behalf.`,
    'accessGrants.descriptions.removing.read.support': `${prefixes.support} see your tenant in the app.`,

    // When a user removes one tenant's access to another
    'accessGrants.descriptions.removing.admin.tenant': `${prefixes.tenant} manage another tenant. ${impact}`,
    'accessGrants.descriptions.removing.write.tenant': `${prefixes.tenant} create anything in the other tenant. ${impact}`,
    'accessGrants.descriptions.removing.read.tenant': `${prefixes.tenant} see anything in the other tenant. ${impact}`,
};
