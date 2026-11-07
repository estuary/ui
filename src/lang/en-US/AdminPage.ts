import { CommonMessages } from 'src/lang/en-US/CommonMessages';
import { CTAs } from 'src/lang/en-US/CTAs';

export const AdminPage: Record<string, string> = {
    'admin.roles.message': `These are all the ${CommonMessages['terms.permissions']} that are currently provisioned. An administrator can update them in the {docLink}.`,
    'admin.roles.message.docLink': `authorization settings`,
    'admin.roles.message.docPath': `https://go.estuary.dev/provision`,

    'admin.cli_api.refreshToken.dialog.alert.tokenEncodingFailed': `An issue was encountered displaying your token. Please generate a new token.`,

    'admin.billing.graph.dataByTask.tooltip': `This graph displays the three, largest data processing tasks over the set interval.`,
    'admin.billing.table.history.label.dataVolume': `Data Volume`,
    'admin.billing.table.history.label.date_start': `Start Date`,
    'admin.billing.table.history.label.date_end': `End Date`,
    'admin.billing.table.history.label.tasks': `Task Usage`,
    'admin.billing.table.history.label.totalCost': `Total Cost`,
    'admin.billing.table.history.tooltip.date_start': `This billing period began on {timestamp}`,
    'admin.billing.table.history.tooltip.date_end': `This billing period ended on {timestamp}`,
    'admin.billing.table.history.emptyTableDefault.header': `No information found.`,
    'admin.billing.table.history.emptyTableDefault.message': `We couldn't find any billing information on file.`,

    'admin.billing.table.line_items.label.description': `Description`,
    'admin.billing.table.line_items.label.count': `Quantity`,
    'admin.billing.table.line_items.label.rate': `Unit Price`,
    'admin.billing.table.line_items.label.subtotal': `Subtotal`,
    'admin.billing.table.line_items.emptyTableDefault.header': `No information found.`,
    'admin.billing.table.line_items.emptyTableDefault.message': `We couldn't find any billing information on file.`,

    'admin.grants.confirmation.alert': `Access to all items will be removed and this action cannot be undone. Please review the list to continue.`,

    'admin.dataPlanes.column.header.name': `Name`,
    'admin.dataPlanes.column.header.region': `Region`,

    // There are dynamically generated in src/components/tables/DataPlanes/index.tsx
    'admin.dataPlanes.private.table.noContent.header': `No private data planes found`,
    'admin.dataPlanes.private.table.noContent.message': `To configure a private data plane, please contact support.`,
    'admin.dataPlanes.public.table.noContent.header': `No data planes found`,
    'admin.dataPlanes.public.table.noContent.message': `There was an issue reaching our servers. Please try again. If the issue persists, ${CTAs['cta.support']}.`,

    'admin.tabs.users': `Account Access`,
    'admin.tabs.api': `CLI-API`,
    'admin.tabs.billing': `Billing`,
    'admin.tabs.settings': `Settings`,

    // Storage Mappings
    'storageMappings.header': `Collection Storage`,
    'storageMappings.message': `Create a Storage Mapping to govern where your data is stored. The primary storage mapping is where new data is written to, both primary and other storage mappings are used to read existing data from.`,

    // Create dialog
    'storageMappings.dialog.create.description': `Add a new storage location for your collection data. For information and access requirements, see the {docLink}.`,
    'storageMappings.dialog.create.description.docPath': `https://docs.estuary.dev/getting-started/installation/#configuring-your-cloud-storage-bucket-for-use-with-flow`,
    'storageMappings.dialog.create.description.docLink': `documentation`,
};
