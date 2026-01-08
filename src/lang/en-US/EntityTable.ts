import { CommonMessages } from 'src/lang/en-US/CommonMessages';
import { CTAs } from 'src/lang/en-US/CTAs';
import { Data } from 'src/lang/en-US/Data';

export const EntityTable: Record<string, string> = {
    'entityTable.title': `Entity Table`,

    'entityTable.data.entity': `Name`,
    'entityTable.data.connectorType': `Type`,
    'entityTable.data.lastUpdated': `Last Updated`,
    'entityTable.data.lastUpdatedWithColon': `Last Updated:`,
    'entityTable.data.specTypeWithColon': `Type:`,
    'entityTable.data.lastPublished': `Published`,
    'entityTable.data.actions': `Actions`,
    'entityTable.data.writesTo': `${Data['data.writes_to']}`,
    'entityTable.data.readsFrom': `${Data['data.reads_from']}`,
    'entityTable.data.status': `Status`,
    'entityTable.data.userFullName': `Name`,
    'entityTable.data.capability': `Capability`,
    'entityTable.data.detail': `Detail`,
    'entityTable.data.objectRole': `Object`,
    'entityTable.data.lastPubUserFullName': `Last Updated By`,
    'entityTable.data.catalogPrefix': `Catalog Prefix`,
    'entityTable.data.provider': `Provider`,
    'entityTable.data.bucket': `Bucket`,
    'entityTable.data.prefix': `Prefix`,
    'entityTable.data.dataPlanes': `Data Planes`,
    'entityTable.data.storagePrefix': `Prefix`,
    'entityTable.data.sharedPrefix': `Shared Prefix`,
    'entityTable.data.sharedWith': `Shared With`,
    'entityTable.data.created': `Created`,
    'entityTable.data.description': `Description`,
    'entityTable.data.user': `User`,
    'entityTable.data.alertTypes': `Alert Types`,

    'entityTable.stats.filter.label': `${
        CommonMessages[`filter.time.label`]
    } Menu`,
    'entityTable.stats.bytes_read': `Bytes Read`,
    'entityTable.stats.docs_read': `Docs Read`,
    'entityTable.stats.bytes_written': `Bytes Written`,
    'entityTable.stats.docs_written': `Docs Written`,

    'entityTable.stats.error': `Failed to fetch stats.`,

    'entityTable.unmatchedFilter.header': `No results found.`,
    'entityTable.unmatchedFilter.message': `We couldn't find any data matching your search. Please try a different filter.`,

    'entityTable.technicalDifficulties.header': `There was an issue getting your data.`,
    'entityTable.technicalDifficulties.message': `We apologize for the inconvenience. You'll find a message describing the issue at the top of the page.`,

    'entityTable.networkFailed.header': `There was a network issue.`,
    'entityTable.networkFailed.message': `Please check your internet connection and reload the application.`,

    'entityTable.moreEntities': `{count} more`,

    'entityTable.detailsLink': `View details`,

    'entityTable.rowSelector.all': `All`,
    'entityTable.rowSelector.none': `None`,

    'entityTable.disableEnable.confirm': `{count} {count, plural, one {item} other {items}} listed below will be {setting}.`,
    'entityTable.delete.confirm': `{count} {count, plural, one {item} other {items}} listed below will be permanently deleted and this action cannot be undone. Please review the list to continue.`,

    'entityTable.viewDetails.aria': `View details of {name}`,
    'entityTable.edit.aria': `Edit specification of {name}`,
    'entityTable.materialize.aria': `Materialize {name}`,

    'entityTable.selectColumn.menu.header': `Select Columns`,
    'entityTable.selectColumn.button.ariaLabel': `Open Table Column Customization Menu`,
    'entityTable.selectColumn.button.tooltip': `Select Columns`,

    'entityTable.download.cta': `Download CSV`,

    // Update Entity
    'updateEntity.noLiveSpecs': `Unable to find entity on server.`,
    'updateEntity.collection.skipped': `${CTAs['cta.enable']} and ${CTAs['cta.disable']} only work on derivations`,

    'updateEntity.running.delete': `Deleting {count} {itemType}`,
    'updateEntity.success.delete': `Deleted {count} {itemType}`,

    // Entity Selector / Add Dialog
    'entityTable.captures.missing.header': `You currently have no captures. Click the captures icon on the menu bar to get started.`,
    'entityTable.materializations.missing.header': `You currently have no materializations. Click the materializations icon on the menu bar to get started.`,

    'entityTable.collections.missing.header': `You currently have no collections. Click the captures icon on the menu bar to get started.`,
    'entityTable.collections.missing.message': `Captures connect to outside systems, pull in data, and generate {docLink} within Flow.`,
    'entityTable.collections.missing.message.docLink': `collections`,
    'entityTable.collections.missing.message.docPath': `https://docs.estuary.dev/concepts/collections/`,
};
