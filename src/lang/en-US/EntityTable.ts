import { CommonMessages } from 'src/lang/en-US/CommonMessages';
import { CTAs } from 'src/lang/en-US/CTAs';
import { Data } from 'src/lang/en-US/Data';

export const EntityTable: Record<string, string> = {
    'entityTable.title': `Entity Table`,

    'entityTable.data.entity': `Name`,
    'entityTable.data.connectorType': `Type`,
    'entityTable.data.lastUpdated': `Last Updated`,
    'entityTable.data.lastPublished': `Published`,
    'entityTable.data.actions': `Actions`,
    'entityTable.data.writesTo': `${Data['data.writes_to']}`,
    'entityTable.data.readsFrom': `${Data['data.reads_from']}`,
    'entityTable.data.userFullName': `Name`,
    'entityTable.data.capability': `Capability`,
    'entityTable.data.detail': `Detail`,
    'entityTable.data.objectRole': `Object`,
    'entityTable.data.catalogPrefix': `Catalog Prefix`,
    'entityTable.data.sharedPrefix': `Shared Prefix`,
    'entityTable.data.sharedWith': `Shared With`,

    'entityTable.stats.bytes_read': `Bytes Read`,
    'entityTable.stats.docs_read': `Docs Read`,
    'entityTable.stats.bytes_written': `Bytes Written`,
    'entityTable.stats.docs_written': `Docs Written`,

    'entityTable.unmatchedFilter.header': `No results found.`,

    'entityTable.technicalDifficulties.header': `There was an issue getting your data.`,

    'entityTable.networkFailed.header': `There was a network issue.`,

    'entityTable.disableEnable.confirm': `{count} {count, plural, one {item} other {items}} listed below will be {setting}.`,
    'entityTable.delete.confirm': `{count} {count, plural, one {item} other {items}} listed below will be permanently deleted and this action cannot be undone. Please review the list to continue.`,

    // Update Entity
    'updateEntity.noLiveSpecs': `Unable to find entity on server.`,
    'updateEntity.collection.skipped': `${CTAs['cta.enable']} and ${CTAs['cta.disable']} only work on derivations`,

    'updateEntity.running.delete': `Deleting {count} {itemType}`,
    'updateEntity.success.delete': `Deleted {count} {itemType}`,

    // Entity Selector / Add Dialog
    'entityTable.captures.missing.header': `You currently have no captures. Click the captures icon on the menu bar to get started.`,
    'entityTable.materializations.missing.header': `You currently have no materializations. Click the materializations icon on the menu bar to get started.`,

    'entityTable.collections.missing.header': `You currently have no collections. Click the captures icon on the menu bar to get started.`,
    'entityTable.collections.missing.message': `Captures connect to outside systems, pull in data, and generate {docLink} within ${CommonMessages.productName}.`,
    'entityTable.collections.missing.message.docLink': `collections`,
    'entityTable.collections.missing.message.docPath': `https://docs.estuary.dev/concepts/collections/`,
};
