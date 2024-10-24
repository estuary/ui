import { CommonMessages, endpointConfigHeader } from './CommonMessages';
import { CTAs } from './CTAs';

const changesRejected = 'rejected due to incompatible collection updates';

const skipDataFlowReset = `Skip data flow reset`;

// TODO (optimization): Consolidate duplicate create and edit messages.
export const Workflows: Record<string, string> = {
    'workflows.error.endpointConfig.empty': `${endpointConfigHeader} empty`,
    'workflows.error.initForm': `An issue was encountered initializing the form.`,
    'workflows.error.initFormSection': `An issue was encountered initializing this section of the form.`,

    'workflows.initTask.alert.title.initFailed': `Form Initialization Error`,
    'workflows.initTask.alert.message.initFailed': `An issue was encountered initializing the form. Try refreshing the page and if the issue persists {docLink}.`,
    'workflows.initTask.alert.message.initFailed.docLink': `${CTAs['cta.support']}`,
    'workflows.initTask.alert.message.initFailed.docPath': `${CommonMessages['support.email']}`,
    'workflows.initTask.alert.message.patchedSpec': `An issue was encountered recovering your changes. The latest, published record of the task was used to initialize the form.`,

    'workflows.save.review.header': `Review Changes`,

    'workflows.collectionSelector.cta.rediscover': `Refresh`,
    'workflows.collectionSelector.cta.rediscover.tooltip': `Refresh bindings with latest from source`,
    'workflows.collectionSelector.cta.schemaEdit': `CLI`,
    'workflows.collectionSelector.cta.schemaInference': `Schema Inference`,
    'workflows.collectionSelector.error.title.editorInitialization': `Editor initialization failed`,
    'workflows.collectionSelector.error.title.missingCollectionSchema': `No collection schema to display`,
    'workflows.collectionSelector.error.message.missingCollectionSchema': `This is normally caused by the {itemType} being disabled during {entityType} creation.`,
    'workflows.collectionSelector.error.fix.missingCollectionSchema': `To see the schema, refresh the {itemType} using the button to the left.`,
    'workflows.collectionSelector.error.message.invalidPubId': `This specification may have diverged from the latest, published record of the collection. Your unpublished changes can be found in the editor.`,
    'workflows.collectionSelector.error.message.draftCreationFailed': `The latest, published record of the collection can be found in the editor. It is read-only.`,
    'workflows.collectionSelector.header.collectionSchema': `Collection Schema`,
    'workflows.collectionSelector.label.discoveredCollections': `Discovered Collections`,
    'workflows.collectionSelector.label.existingCollections': `Existing Collections`,
    'workflows.collectionSelector.label.listHeader': `Collections`,
    'workflows.collectionSelector.tab.collectionSchema': `Collection`,
    'workflows.collectionSelector.tab.resourceConfig': `Config`,

    'workflows.collectionSelector.toggle.enable': `Enable Page`,
    'workflows.collectionSelector.toggle.disable': `Disable Page`,
    'workflows.collectionSelector.toggle.enable.tooltip': `Enable all {itemType} in the list below`,
    'workflows.collectionSelector.toggle.disable.tooltip': `Disable all {itemType} in the list below`,
    'workflows.collectionSelector.toggle.enable.all': `Enable All`,
    'workflows.collectionSelector.toggle.disable.all': `Disable All`,
    'workflows.collectionSelector.toggle.enable.all.tooltip': `Enable all {itemType} in this {entityType} (ignores any filtering)`,
    'workflows.collectionSelector.toggle.disable.all.tooltip': `Disable all {itemType} in this {entityType} (ignores any filtering)`,

    'workflows.collectionSelector.notifications.remove': `{count} {itemType} removed`,
    'workflows.collectionSelector.notifications.toggle.enable': `{count} {itemType} enabled`,
    'workflows.collectionSelector.notifications.toggle.disable': `{count} {itemType} disabled`,

    'workflows.collectionSelector.schemaEdit.cta.syncSchema': `Synchronize Schema`,
    'workflows.collectionSelector.schemaEdit.header': `CLI`,
    'workflows.collectionSelector.schemaEdit.flowctlDocLink': `https://docs.estuary.dev/concepts/flowctl/`,
    'workflows.collectionSelector.schemaEdit.description': `Use the commands below to edit the schema for this collection. Once executed, click the Synchronize Schema button below to pull the changes on the server into the UI.`,
    'workflows.collectionSelector.schemaEdit.message1': `Pull down the draft to edit`,
    'workflows.collectionSelector.schemaEdit.message2': `Push your changes up to the server`,
    'workflows.collectionSelector.schemaEdit.discoveredCollection.command1': `flowctl draft select --id {draftId} && flowctl draft develop`,
    'workflows.collectionSelector.schemaEdit.discoveredCollection.command2': `flowctl draft author --source <flow_catalog_file_location>`,
    'workflows.collectionSelector.schemaEdit.existingCollection.command1': `flowctl draft select --id {draftId}`,
    'workflows.collectionSelector.schemaEdit.existingCollection.command2': `flowctl catalog draft --name {catalogName} && flowctl draft develop`,
    'workflows.collectionSelector.schemaEdit.existingCollection.command3': `flowctl draft author --source <flow_catalog_file_location>`,
    'workflows.collectionSelector.schemaEdit.alert.message.schemaUpdateError': `An error was encountered fetching your updated collection schema to display. This does not mean that there was a problem updating the server. Open the CLI popper and click the Synchronize Schema button to try again.`,

    'workflows.collectionSelector.schemaInference.header': `Schema Inference`,
    'workflows.collectionSelector.schemaInference.message': `Flow can help you tighten your collection specification. It will review the documents in a collection and approximate the shape of your data.`,
    'workflows.collectionSelector.schemaInference.message.schemaDiff': `The difference between the current collection specification and the specification containing the inferred schema is highlighted below.`,
    'workflows.collectionSelector.schemaInference.message.documentsRead': `A total of {documents_read} documents were evaluated to generate the inferred schema.`,
    'workflows.collectionSelector.schemaInference.alert.noDocuments.header': `No Documents Found`,
    'workflows.collectionSelector.schemaInference.alert.noDocuments.message': `We were unable to find any documents in this collection. Consequently, could not infer the shape of its data.`,
    'workflows.collectionSelector.schemaInference.alert.lowDocumentCount.header': `Low Document Count`,
    'workflows.collectionSelector.schemaInference.alert.lowDocumentCount.message': `Fewer documents than desired were found. This could mean that your collection isn't seeing very much data.`,
    'workflows.collectionSelector.schemaInference.alert.generalError.header': `Server Error`,
    'workflows.collectionSelector.schemaInference.alert.inferenceService.message': `An error was encountered while inferring the shape of the documents in this collection.`,
    'workflows.collectionSelector.schemaInference.alert.patchService.message': `An error was encountered while applying the inferred schema. Please try again. If the error persists, {docLink}`,
    'workflows.collectionSelector.schemaInference.alert.patchService.message.docLink': `${CTAs['cta.support']}`,
    'workflows.collectionSelector.schemaInference.alert.patchService.message.docPath': `${CommonMessages['support.email']}`,
    'workflows.collectionSelector.schemaInference.cta.continue': `Apply Inferred Schema`,

    'workflows.collectionSelector.manualBackfill.header': `Backfill`,
    'workflows.collectionSelector.manualBackfill.notSupported.title': `This {entityType} doesn’t support backfills.`,
    'workflows.collectionSelector.manualBackfill.notSupported.message': `To backfill, disable each binding, save and then re-enable and save.`,
    'workflows.collectionSelector.manualBackfill.message.capture': `Trigger a backfill of this collection from the source when published.`,
    'workflows.collectionSelector.manualBackfill.message.capture.allBindings': `Trigger a backfill of all collections from the source when published. The UI will mark all collections to be backfilled but the server will filter out those that cannot be backfilled (e.g. disabled collections).`,
    'workflows.collectionSelector.manualBackfill.message.materialization': `Trigger a backfill from the source collection to its materialized resource when published.`,
    'workflows.collectionSelector.manualBackfill.message.materialization.allBindings': `Trigger a backfill from all source collections to their materialized resource when published. The UI will mark all collections to be backfilled but the server will filter out those that cannot be backfilled (e.g. disabled collections).`,
    'workflows.collectionSelector.manualBackfill.cta.backfill': `Backfill`,
    'workflows.collectionSelector.manualBackfill.count': `{backfillCount} of {bindingsTotal} {itemType} backfilling`,
    'workflows.collectionSelector.manualBackfill.count.empty': `no {itemType} marked for backfill`,
    'workflows.collectionSelector.manualBackfill.count.disabled': `no {itemType} available to backfill`,
    'workflows.collectionSelector.manualBackfill.count.aria': `Backfill count`,

    'workflows.collectionSelector.evolvedCollections.alert': `Reversioned {itemType} will backfill on their own`,
    'workflows.collectionSelector.evolvedCollections.count': `{count} {itemType} reversioning`,

    'workflows.collectionSelector.manualBackfill.error.title': `Backfill update failed`,
    'workflows.collectionSelector.manualBackfill.error.message.singleCollection': `There was an issue updating the backfill counter for one or more bindings associated with collection, {collection}.`,
    'workflows.collectionSelector.manualBackfill.error.message.allBindings': `There was an issue updating the backfill counter for one or more bindings.`,

    'workflows.entityWarnings.title': `No collections`,
    'workflows.entityWarnings.message': `You have not added any collections yet. This means there will be
                no data output from this materialization. To add collections,
                use the Output Collections section.`,

    'workflows.autoDiscovery.header': `Schema Evolution`,
    'workflows.autoDiscovery.label.optIntoDiscovery': `Automatically keep schemas up to date`,
    'workflows.autoDiscovery.label.addNewBindings': `Automatically add new collections`,
    'workflows.autoDiscovery.label.evolveIncompatibleCollection': `Changing primary keys re-versions collections`,
    'workflows.autoDiscovery.update.failed': `Schema evolution update failed`,

    'workflows.sourceCapture.header': `Link Capture`,
    'workflows.sourceCapture.cta': `Source From Capture`,
    'workflows.sourceCapture.cta.edit': `Edit Source Capture`,
    'workflows.sourceCapture.cta.loading': `${CommonMessages['common.loading']}`,
    'workflows.sourceCapture.selected.none': `no linked capture`,
    'workflows.sourceCapture.optin.message': `Select a capture to link to your materialization.  Collections added to your capture will automatically be added to your materialization.`,
    'workflows.sourceCapture.optin.message2': `Removing this will not remove associated collections.`,

    'workflows.guards.admin.title': `Missing required ${CommonMessages['terms.permissions']}`,
    'workflows.guards.admin.message': `You must have the admin capability to at least one prefix to create a {entityType}. Please contact an administrator to request access.`,

    'workflows.advancedSettings.title': `Advanced Options`,
    'workflows.disable.autoEnabledAlert.title': `{entityType} enabled`,
    'workflows.disable.autoEnabledAlert.message': `We have automatically enabled this {entityType} to ensure we can test the connection with the endpoint.`,
    'workflows.disable.autoEnabledAlert.instructions': `To keep the {entityType} disabled you will need to disable before publishing.`,
    'workflows.disable.title': `Enable {entityType}`,
    'workflows.disable.message': `Control whether your {entityType} is disabled. This setting takes effect when your changes are published.`,
    'workflows.disable.update.error': `Failed to update {entityType}. Please check your network connection and try again.`,

    //  PreSave prompts
    'preSavePrompt.dialog.title': `Save and Publish`,
    'preSavePrompt.reviewSelection.title': `Review changes`,
    'preSavePrompt.publish.title': `Save and publish`,
    'preSavePrompt.logs.spinner.stopped': `done`,
    'preSavePrompt.logs.spinner.running': `loading...`,

    'preSavePrompt.draftErrors.title': `Draft Errors`,
    'preSavePrompt.draftErrors.message': `There is an issue with the drafted version of your entity. Please contact support immediately.`,

    // Reset Data Flow
    'resetDataFlow.dialog.title': `Data Flow Reset`,

    'resetDataFlow.selectMaterialization.title': `Select materialization for data flow reset`,

    'resetDataFlow.reviewSelection.title': `Review changes`,

    'resetDataFlow.disableCapture.title': `Disable capture`,

    'resetDataFlow.waitForShardToIdle.title': `Wait for capture to fully stop`,
    'resetDataFlow.waitForShardToIdle.success': `Stopped at {timeStopped} (UTC)`,

    'resetDataFlow.updateMaterialization.title': `Update materialization`,
    'resetDataFlow.updateMaterialization.skipped': `Skipped - no matching bindings`,

    'resetDataFlow.enableCapture.title': `Enable capture`,

    'resetDataFlow.publish.title': `Publish data flow reset`,

    'resetDataFlow.errors.publishFailed': `Publishing failed.`,
    'resetDataFlow.errors.missingSession': `Cannot find user session.`,
    'resetDataFlow.errors.incompatibleCollections': `Publishing ${changesRejected}. Please reach out to support for assistance.`,
    'resetDataFlow.disableCapture.errors.incompatibleCollections': `Publishing ${changesRejected}. Please reversion the collections, mark backfills and try again.`,

    'resetDataFlow.materializations.header': `Below are ${CommonMessages['terms.destinations.lowercase']} that are linked to this capture.`,
    'resetDataFlow.materializations.empty.header': `No related materializations`,
    'resetDataFlow.materializations.empty.message': `No materializations with a source capture found.  Pick one manually or skip this step.`,
    'resetDataFlow.materializations.empty.warning': `Skipping this step will only backfill your capture and won’t reset your dataflow.`,
    'resetDataFlow.materializations.selector.label': `${CommonMessages['terms.destination']} to backfill`,
    'resetDataFlow.materializations.selector.helper': `Select one (1) ${CommonMessages['terms.destination']}`,
    'resetDataFlow.materializations.chip.empty': `no ${CommonMessages['terms.materialization']} selected`,
    'resetDataFlow.materializations.empty.skip': `${skipDataFlowReset}`,
    'resetDataFlow.materializations.noOverlap.title': `${CommonMessages['terms.destination']} does not read any of the backfilled bindings.`,
    'resetDataFlow.materializations.noOverlap.message': `Please select another ${CommonMessages['terms.destination.lowercase']} to continue resetting the data flow or click "${skipDataFlowReset}"`,

    'resetDataFlow.reviewSelection.warning.title': `Once this process starts, you must stay on the page`,
    'resetDataFlow.reviewSelection.warning.message': `Do not navigate away or reload. If you have any issues, please contact {docLink}`,
    'resetDataFlow.reviewSelection.warning.message.docLink': `support@estuary.dev`,
    'resetDataFlow.reviewSelection.warning.message.docPath': `${CommonMessages['support.email']}`,
    'resetDataFlow.reviewSelection.header': `Change Summary`,

    'resetDataFlow.reviewSelection.instructions': `The following data flow will be reset:`,
    'preSavePrompt.reviewSelection.instructions': `The following entities will be impacted by this change:`,

    'resetDataFlow.selectMaterialization.selected.none': `no materialization selected`,

    'resetDataFlow.editor.warning.title': `Editing disabled`,
    'resetDataFlow.editor.warning.message': `While backfilling the ${CommonMessages['terms.dataFlow']} you cannot manually edit your spec.`,

    'workflows.collectionSelector.dataFlowBackfill.header': `Choose to backfill just your capture or the entire ${CommonMessages['terms.dataFlow']}.`,
    'workflows.collectionSelector.dataFlowBackfill.option': `Backfill Data Flow`,
    'workflows.collectionSelector.dataFlowBackfill.message': `Backfill capture and reset corresponding tables in a linked materialization.`,

    'workflows.dataPlane.description': `Choose the data plane you would like to use.`,
    'workflows.dataPlane.label': `Data Plane`,

    // Field Selection
    'fieldSelection.header': `Field Selection`,
    'fieldSelection.table.label': `Field Selection Editor`,
    'fieldSelection.message': `Determine which fields in your collection get materialized. By default, the connector dynamically selects the fields exported by your materialization. Click "${CTAs['cta.refresh']}" to update the table below. For more details, please {docLink}.`,
    'fieldSelection.message.docLink': `see the docs`,
    'fieldSelection.message.docPath': `https://docs.estuary.dev/guides/customize-materialization-fields/`,

    'fieldSelection.cta.defaultAllFields': `Include recommended fields`,
    'fieldSelection.dialog.refreshFields.header': `Please wait while we gather information about your resource fields`,
    'fieldSelection.dialog.updateProjection.header': `Update Projection`,
    'fieldSelection.dialog.updateProjection.header.new': `Add Projection`,
    'fieldSelection.dialog.updateProjection.message': `Update projection for collection, {collection}, to change how the field appears when materialized.`,
    'fieldSelection.dialog.updateProjection.cta.apply': `Apply`,
    'fieldSelection.dialog.updateProjection.label.fieldName': `Field Name:`,
    'fieldSelection.dialog.updateProjection.label.pointer': `JSON Pointer:`,
    'fieldSelection.dialog.updateProjection.label.type': `Type:`,
    'fieldSelection.refresh.alert': `Refreshing the fields is recommended as editing the config can sometimes change the options below.`,
    'fieldSelection.update.failed': `Field selection update failed`,
    'fieldSelection.table.cta.addProjection': `Add Projection`,
    'fieldSelection.table.cta.defaultField': `Default`,
    'fieldSelection.table.cta.defaultAllFields': `Default All`,
    'fieldSelection.table.cta.excludeField': `Exclude`,
    'fieldSelection.table.cta.excludeAllFields': `Exclude All`,
    'fieldSelection.table.cta.includeField': `Include`,
    'fieldSelection.table.cta.renameField': `Rename`,
    'fieldSelection.table.empty.header': `No information found`,
    'fieldSelection.table.empty.message': `Click "Refresh" to evaluate the fields of the source collection.`,
    'fieldSelection.table.error.message': `There was an error attempting to fetch the list of fields.`,
    'fieldSelection.table.label.fieldRequired': `Field Required`,
    'fieldSelection.table.label.locationRequired': `Location Required`,
    'fieldSelection.table.label.locationRecommended': `Location Recommended`,
    'fieldSelection.table.label.fieldOptional': `Field Optional`,
    'fieldSelection.table.label.fieldForbidden': `Field Forbidden`,
    'fieldSelection.table.label.unsatisfiable': `Unsatisfiable`,
    'fieldSelection.table.label.unknown': `Unknown`,
    'fieldSelection.table.label.filter': `Filter fields`,

    // Messages from binding editing
    'updateBinding.error.noBinding': `Unable to update the proper binding. Contact Support.`,

    // Time Travel
    'notBeforeNotAfter.header': `Time Travel`,
    'notBeforeNotAfter.message': `Include only data from before or after a specific time period.  This should only be used when first setting up your destination or it will not have an effect.`,
    'notBeforeNotAfter.update.error': `Changes to draft not saved.`,
    'notAfter.input.label': `Not After`,
    'notAfter.input.description': `only include data from before this time (UTC)`,
    'notBefore.input.label': `Not Before`,
    'notBefore.input.description': `only include data from after this time (UTC)`,

    // Incompatible Schema Change
    'incompatibleSchemaChange.header': `Incompatible Schema Change`,
    'incompatibleSchemaChange.message': `The action to take when a schema change is rejected due to incompatibility. If blank, the binding will backfill and be re-materialized.`,
    'incompatibleSchemaChange.update.error': `Changes to draft not saved.`,
    'incompatibleSchemaChange.input.label': `Action on rejected schema change`,

    'incompatibleSchemaChange.error.cta': `Remove Setting`,
    'incompatibleSchemaChange.error.title': `Invalid setting`,
    'incompatibleSchemaChange.error.message': `The current setting "{currentSetting}" does not match a known option. Please update or remove.`,

    'incompatibleSchemaChange.options.abort.label': `Abort`,
    'incompatibleSchemaChange.options.abort.description': `Fail the publication of the incompatible schema change. This prevents any schema change from being applied if it is incompatible with the existing schema, as determined by the connector.`,

    'incompatibleSchemaChange.options.backfill.label': `Backfill`,
    'incompatibleSchemaChange.options.backfill.description': `Increment the backfill counter of the binding, causing it to start over from the beginning.`,

    'incompatibleSchemaChange.options.disableBinding.label': `Disable Binding`,
    'incompatibleSchemaChange.options.disableBinding.description': `Disable the binding, which will be effectively excluded from the task until it is re-enabled.`,

    'incompatibleSchemaChange.options.disableTask.label': `Disable Task`,
    'incompatibleSchemaChange.options.disableTask.description': `Disable the entire task, preventing it from running until it is re-enabled.`,

    // Entities Create
    'entityCreate.catalogEditor.heading': `Advanced Specification Editor`,
    'entityCreate.docs.header': `Connector Help`,
    'entityCreate.cta.docs': `Connector Help`,
    'entityCreate.errors.collapseTitle': `View logs`,
    'entityCreate.errors.collapseTitleOpen': `Hide logs`,
    'entityCreate.sops.failedTitle': `Configuration Encryption Failed`,
    'entityCreate.endpointConfig.heading': `2. ${endpointConfigHeader}`,
    'entityCreate.endpointConfig.errorSummary': `There are issues with the form.`,
    'entityCreate.instructions': `To start select a Connector below. Once you make a selection the rest of the form will display and you can configure your endpoint. You can search by name and if you do not find what you are looking for please let us know by requesting the connector.`,

    'entityCreate.endpointConfig.detailsHaveErrors': `The Details section has errors:`,
    'entityCreate.endpointConfig.resourceConfigHaveErrors': `The Collections section has errors:`,
    'entityCreate.endpointConfig.fullSourceHaveErrors': `The Time Travel section has errors:`,
    'entityCreate.endpointConfig.endpointConfigHaveErrors': `The ${endpointConfigHeader} section has errors:`,

    'entityCreate.endpointConfig.noConnectorSelectedTitle': `Please select a Connector to begin`,
    'entityCreate.endpointConfig.noConnectorSelected': `To start the creation process you must select a Connector. You can change this later.`,

    'entityCreate.endpointConfig.entityNameMissing': `Name missing`,
    'entityCreate.endpointConfig.entityNameInvalid': `Name invalid`,
    'entityCreate.endpointConfig.connectorMissing': `Connector missing`,
    'entityCreate.endpointConfig.endpointConfigMissing': `${endpointConfigHeader} empty`,
    'entityCreate.endpointConfig.collectionsMissing': `${CommonMessages['terms.collections']} missing`,
    'entityCreate.endpointConfig.resourceConfigInvalid': `Resource Config invalid`,
    'entityCreate.endpointConfig.fullSourceInvalid': `Time Travel invalid`,

    'entityCreate.endpointConfig.configCanBeBlank.message': `This {entityType} requires no configuration.`,

    'entityCreate.bindingsConfig.addCTA': `Add {itemType}`,
    'entityCreate.bindingsConfig.noRows': `Start by clicking the 'add' button above and selecting what you want to`,
    'entityCreate.bindingsConfig.noRowsTitle': `No selection made`,
    'entityCreate.bindingsConfig.list.search': `Filter {itemType}`,
    'entityCreate.bindingsConfig.list.removeAll': `Remove {itemType} in the list below`,

    'entityCreate.connector.label': `${CommonMessages['connector.label']} Search`,
    'entityCreate.errors.missingDraftId': `Missing Draft ID.`,

    'entityCreate.errors.cannotFetchLiveSpec': `Unable to fetch the proper details to materialize. Try again.`,

    'discovery.failed.title': `Generating Specification Failed`,
    'discovery.failed.message': `There was an issue attempting to discover your endpoint. Please review details below.`,

    // Entity Edit
    'entityEdit.alert.detailsFormDisabled': `The details form cannot be edited at this time.`,
    'entityEdit.alert.endpointConfigDisabled': `Editing of the endpoint configuration form disabled.`,

    // Entity Evolution
    'entityEvolution.failure.errorTitle': `Update Failed`,
    'entityEvolution.serverUnreachable': `${CommonMessages['common.failedFetch']} while trying to update collections`,
    'entityEvolution.error.title': `Changes ${changesRejected}`,
    'entityEvolution.error.message': `The proposed collection changes would break downstream tasks. You can click '${CTAs['cta.evolve']}' below to automatically update your draft with the following recommended actions.`,
    'entityEvolution.error.note': `Note: This may result in additional cost as new versions are backfilled.`,

    // Single quotes are special and must be doubled: https://formatjs.io/docs/core-concepts/icu-syntax#quoting--escaping
    'entityEvolution.action.recreateOneBinding.description': `the materialization ''{materializationName}'' will be updated to increment the backfill counter and re-materialize the collection`,
    'entityEvolution.action.recreateBindings.description': `{materializationCount} {materializationCount, plural,
        one {Materialization}
        other {Materializations}
    } will be updated to increment the backfill counters and re-materialize the collection`,
    'entityEvolution.action.recreateBindings.help': `The materialization will be updated to increment the ''backfill'' property of the affected binding, which causes it to re-create destination resources (such as tables) and re-materialize the source collection from the beginning. Other bindings in the materialization will not be affected. The source collection will retain all current data.`,

    'entityEvolution.action.recreateCollection.description': `Collection will be re-created as ''{newName}'' because {reason}`,
    'entityEvolution.action.recreateCollection.help': `This will create a new collection with the name shown.
    The capture will be updated to write into the new collection, and will backfill the collection from source system.
    Any materializations will also be updated to materialize the new collection instead of the old one.
    The result will be a new resource (database table, for example) with an incremented version suffix (like "_v2")`,

    'entityEvolution.action.recreateCollection.reason.keyChange':
        'the collection key cannot be modified',
    'entityEvolution.action.recreateCollection.reason.partitionChange':
        'the collection partitions cannot be modified',
    'entityEvolution.action.recreateCollection.reason.prevDeletedSpec':
        'a live spec with this same name has already been created and was subsequently deleted',
    'entityEvolution.action.recreateCollection.reason.authoritativeSourceSchema':
        'a live spec with this same name has already been created and was subsequently deleted',

    // Entities Hydrator
    'entitiesHydrator.error.failedToFetch': `There was an issue while checking if you have any roles.`,

    // Entity Not Found
    'entityNotFound.heading': `Sorry, that entity cannot be found.`,
    'entityNotFound.message.default': `The entity you are looking for`,
    'entityNotFound.detail': `was unable to be found.`,
    'entityNotFound.explanation': `This is likely because it has been deleted or you do not have access.`,

    // Entity Status
    'entityStatus.green': `Running`,
    'entityStatus.yellow': `Alerts`,
    'entityStatus.red': `Stopped`,

    // Existing Entity Check
    'existingEntityCheck.heading': `One more thing...`,
    'existingEntityCheck.instructions': `We found at least one {connectorName} {entityType} in the system.`,

    'existingEntityCheck.instructions2': `Adding to an existing {entityType} can help save time and cut cost. Choose a {entityType} from the list to edit it. If you'd still prefer to start from scratch, select the New {connectorName} {entityType} option below.`,

    'existingEntityCheck.toolbar.label.filter': `Search existing tasks`,
    'existingEntityCheck.toolbar.label.sortDirection': `Sort Direction`,

    'existingEntityCheck.existingCard.label.lastPublished': `Last published on {date}`,
    'existingEntityCheck.filter.unmatched.header': `No results found.`,
    'existingEntityCheck.filter.unmatched.message': `We couldn't find any data matching your search. Please try a different filter.`,

    'existingEntityCheck.newCard.label': `New {connectorName} {entityType}`,

    // Docs
    'docs.iframe.title': `{connector} Documentation`,
    'docs.iframe.disabled.title': `Connector documentation disabled`,
    'docs.iframe.disabled.message': `We cannot open 3rd party documentation inline. To view you must open {docLink} in a new window.`,
    'docs.iframe.disabled.message.docLink': `connector help`,
    'docs.cta.expand': `Help`,
    'docs.cta.expand.tooltip': `Expand Connector Help`,
    'docs.cta.expand.disabled': `Open 3rd party docs in new window`,

    // Schema Editor for Collections
    'schemaEditor.fields.label': `Schema`,
    'schemaEditor.key.label': `Key`,
    'schemaEditor.key.helper': `Ordered JSON Pointers that define how a composite key may be extracted from a collection document.`,
    'schemaEditor.table.empty.header': `No fields to display.`,
    'schemaEditor.table.empty.message': `We were unable to generate a table from the current schema. Please update the schema.`,
    'schemaEditor.table.empty.filtered.message': `This schema does not contain these kind of fields.`,
    'schemaEditor.error.title': `Schema Invalid`,
    'schemaEditor.table.filter.label': `Filter fields`,
    'schemaEditor.table.filter.option.all': `All`,
    'schemaEditor.table.filter.option.must': `Must exist`,
    'schemaEditor.table.filter.option.may': `May exist`,
    'keyAutoComplete.keys.group.must': `Fields that always exist`,
    'keyAutoComplete.keys.group.may': `Fields that sometimes exist`,
    'keyAutoComplete.keys.invalid.message': `Field is not a valid key. Please remove or update the schema.`,
    'keyAutoComplete.keys.invalid.message.readOnly': `Field is not a valid key. Please update the schema.`,
    'keyAutoComplete.keys.missing.title': `Key is empty`,
    'keyAutoComplete.keys.missing.message': `All collections require a key. Please provide a key to continue.`,
    'keyAutoComplete.noOptions.message': `Without a valid schema we cannot provide options for the key. Please fix schema.`,
    'keyAutoComplete.noUsableKeys.message': `No fields in the schema are valid keys. Please update schema.`,

    // Task Endpoints
    'taskEndpoint.list.title': `Endpoints`,
    'taskEndpoint.otherProtocol.message': `{protocol} hostname: {hostname}`,
    'taskEndpoint.multipleEndpoints.message': `multiple endpoints exposed, see task details for their addresses.`,

    'taskEndpoint.link.public.label': 'Public endpoint: ',
    'taskEndpoint.link.private.label': 'Private endpoint: ',
    'taskEndpoint.visibility.public.tooltip':
        'Public: anyone may access this port over the public internet',
    'taskEndpoint.visibility.private.tooltip':
        'Private: access to this port is restricted to authenticated users who have "admin" permissions to the task',

    // Logs Dialog
    'logs.paused': `paused`,
    'logs.noLogs': `stopped checking for logs`,
    'logs.restartLink': `click here`,
    'logs.tooManyEmpty': `Logs for this build may have ended. {restartCTA} to start waiting for new logs again.`,
    'logs.networkFailure': `We encountered a problem streaming logs. Please check your network connection and {restartCTA} to start waiting for new logs again.`,
};
