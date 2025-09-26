import {
    CommonMessages,
    endpointConfigHeader,
} from 'src/lang/en-US/CommonMessages';
import { CTAs } from 'src/lang/en-US/CTAs';

const trialDuration = import.meta.env.VITE_TRIAL_DURATION;

const changesRejected = 'rejected due to incompatible collection updates';

const autoDiscoverHeader = `Schema Evolution`;
const optIntoDiscovery = `Automatically keep schemas up to date`;

// TODO (optimization): Consolidate duplicate create and edit messages.
export const Workflows: Record<string, string> = {
    'workflows.error.endpointConfig.empty': `${endpointConfigHeader} empty`,
    'workflows.error.initForm': `An issue was encountered initializing the form.`,
    'workflows.error.initFormSection': `An issue was encountered initializing this section of the form.`,
    'workflows.error.oldBoundCollection.added': `Your account uses Estuary's Trial bucket which includes ${trialDuration} days of storage and this collection is older than that. To ensure you have all data, please also backfill this collection from the source after adding it to the materialization.`,
    'workflows.error.oldBoundCollection.backfillAll': `Your account uses Estuary's Trial bucket which includes ${trialDuration} days of storage. There are collections bound to this materialization that are older than that.`,
    'workflows.error.oldBoundCollection.backfill': `Your account uses Estuary's Trial bucket which includes ${trialDuration} days of storage and this collection is older than that. Data will be missing if you backfill from the materialization so we recommend backfilling from the source.`,

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

    'workflows.collectionSelector.toggle.enable.tooltip': `Enable all {itemType} in the list below`,
    'workflows.collectionSelector.toggle.disable.tooltip': `Disable all {itemType} in the list below`,
    'workflows.collectionSelector.toggle.enable.all': `Enable All`,
    'workflows.collectionSelector.toggle.disable.all': `Disable All`,

    'workflows.collectionSelector.notifications.remove': `{count} {itemType} removed`,
    'workflows.collectionSelector.notifications.toggle.enable': `{count} {itemType} enabled`,
    'workflows.collectionSelector.notifications.toggle.disable': `{count} {itemType} disabled`,
    'workflows.collectionSelector.notifications.toggle.disable.error': `Changes reverted. Unable to update server. Please try again.`,

    'workflows.collectionSelector.footer.count': `total: {totalCount}`,
    'workflows.collectionSelector.footer.count.empty': ` `,
    'workflows.collectionSelector.footer.enabledCount': `enabled: {disabledBindingsCount}`,
    'workflows.collectionSelector.footer.enabledCount.all': `all enabled`,
    'workflows.collectionSelector.footer.enabledCount.empty': `all disabled`,

    'workflows.collectionSelector.footer.backfilled': `backfilled: {calculatedCount}`,
    'workflows.collectionSelector.footer.backfilled.all': `all backfilled`,
    'workflows.collectionSelector.footer.backfilled.empty': `-`,

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
    'workflows.collectionSelector.manualBackfill.notSupported.message': `Please {docLink} for help with a backfill.`,
    'workflows.collectionSelector.manualBackfill.notSupported.message.docLink': `${CTAs['cta.support']}`,
    'workflows.collectionSelector.manualBackfill.notSupported.message.docPath': `${CommonMessages['support.email']}`,

    'workflows.collectionSelector.manualBackfill.message.capture': `Trigger a backfill of this collection from the source when published.`,
    'workflows.collectionSelector.manualBackfill.message.capture.allBindings': `Trigger a backfill of all collections from the source when published. The UI will mark all collections to be backfilled but the server will filter out those that cannot be backfilled (e.g. disabled collections).`,
    'workflows.collectionSelector.manualBackfill.message.materialization': `Trigger a backfill from the source collection to its materialized resource when published.`,
    'workflows.collectionSelector.manualBackfill.message.materialization.allBindings': `Trigger a backfill from all source collections to their materialized resource when published. The UI will mark all collections to be backfilled but the server will filter out those that cannot be backfilled (e.g. disabled collections).`,
    'workflows.collectionSelector.manualBackfill.cta.backfill': `Backfill`,
    'workflows.collectionSelector.manualBackfill.count': `{backfillCount} of {bindingsTotal} {itemType} will be backfilled`,
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

    'workflows.autoDiscovery.header': `${autoDiscoverHeader}`,
    'workflows.autoDiscovery.label.optIntoDiscovery': `${optIntoDiscovery}`,
    'workflows.autoDiscovery.label.addNewBindings': `Automatically add new collections`,
    'workflows.autoDiscovery.label.evolveIncompatibleCollection': `Changing primary keys re-versions collections`,
    'workflows.autoDiscovery.update.failed': `Schema evolution update failed`,

    'workflows.sourceCapture.header': `Link Capture`,
    'workflows.sourceCapture.cta.loading': `${CommonMessages['common.loading']}`,
    'workflows.sourceCapture.selected.none': `no linked capture`,
    'workflows.sourceCapture.optin.message': `Linking a capture to a materialization automatically adds all newly discovered collections as bindings to the materialization. Unlinking does not remove any existing bindings.`,

    'workflows.guards.admin.title': `Missing required ${CommonMessages['terms.permissions']} or Storage Mapping`,
    'workflows.guards.admin.message': `You must have the admin capability to at least one prefix with a storage mapping to create a {entityType}. Please contact an administrator to request access.`,

    'workflows.guards.edit.title': `Missing edit ${CommonMessages['terms.permissions']}`,
    'workflows.guards.edit.message': `You do not have edit capabilities for this {entityType}. Please contact an administrator to request access.`,

    'workflows.advancedSettings.title': `Advanced Options`,
    'workflows.disable.autoEnabledAlert.title': `{entityType} enabled`,
    'workflows.disable.autoEnabledAlert.message': `We have automatically enabled this {entityType} to ensure we can test the connection with the endpoint.`,
    'workflows.disable.autoEnabledAlert.instructions': `To keep the {entityType} disabled you will need to disable before publishing.`,
    'workflows.disable.title': `Enable {entityType}`,
    'workflows.disable.message': `Control whether your {entityType} is disabled. This setting takes effect when your changes are published.`,
    'workflows.disable.update.error': `Failed to update {entityType}. Please check your network connection and try again.`,

    // Collection Reset
    'collectionReset.editor.warning.title': `Editing disabled`,
    'collectionReset.editor.warning.message': `While backfilling the ${CommonMessages['terms.dataFlow']} you cannot manually edit your spec.`,

    'workflows.dataFlowBackfill.label': `Backfill Mode`,
    'workflows.dataFlowBackfill.options.reset.label': `Dataflow Reset`,
    'workflows.dataFlowBackfill.options.reset.description': `Backfill data from the source, reset inferred schemas, drop and re-create all destination tables and derivations.`,
    'workflows.dataFlowBackfill.options.incremental.label': `Incremental backfill (advanced)`,
    'workflows.dataFlowBackfill.options.incremental.description': `Re-extract all source data and Insert or Append into your existing destination tables without dropping and recreating them.`,

    'workflows.dataPlane.description': `Choose the data plane you would like to use.`,
    'workflows.dataPlane.label': `Data Plane`,
    'workflows.dataPlane.label.noOptionsFound': `No options found`,

    'workflows.alert.endpointConfigEmpty': `This endpoint requires configuration of the external system only.`,

    // Field Selection
    'fieldSelection.header': `Field Selection`,
    'fieldSelection.table.label': `Field Selection Editor`,
    'fieldSelection.message': `Determine which fields in your collection get materialized. By default, the connector dynamically selects the fields exported by your materialization. Click "${CTAs['cta.refresh']}" to update the table below. For more details, please {docLink}.`,
    'fieldSelection.message.docLink': `see the docs`,
    'fieldSelection.message.docPath': `https://docs.estuary.dev/guides/customize-materialization-fields/`,

    'fieldSelection.cta.selectAlgorithm': `Mode`,
    'fieldSelection.dialog.refreshFields.header': `Please wait while we gather information about your resource fields`,
    'fieldSelection.refresh.alert': `Refreshing the fields is recommended as editing the config can sometimes change the options below.`,
    'fieldSelection.error.serverUpdateFailed': `Field selection update failed`,
    'fieldSelection.error.validationFailed': `Field selection validation failed for {collection}.`,
    'fieldSelection.table.cta.excludeAll': `Exclude All`,
    'fieldSelection.table.cta.excludeField': `Exclude`,
    'fieldSelection.table.cta.requireField': `Require`,
    'fieldSelection.table.cta.selectField': `Select`,
    'fieldSelection.table.empty.header': `No information found`,
    'fieldSelection.table.empty.message': `Click "Refresh" to evaluate the fields of the source collection.`,
    'fieldSelection.table.noDraft.message': `Click "Next" at the top of the page to add this binding to the draft.`,
    'fieldSelection.table.error.message': `There was an error attempting to fetch the list of fields.`,
    'fieldSelection.table.label.collectionOmits': `Collection Omits`,
    'fieldSelection.table.label.connectorForbids': `Connector Forbids`,
    'fieldSelection.table.label.connectorOmits': `Connector Omits`,
    'fieldSelection.table.label.connectorIncompatible': `Connector Incompatible`,
    'fieldSelection.table.label.coveredLocation': `Covered Location`,
    'fieldSelection.table.label.duplicateFold': `Duplicate Fold`,
    'fieldSelection.table.label.duplicateLocation': `Duplicate Location`,
    'fieldSelection.table.label.excludedParent': `Excluded Parent`,
    'fieldSelection.table.label.notSelected': `Not Selected`,
    'fieldSelection.table.label.userExcludes': `User Excludes`,
    'fieldSelection.table.label.connectorRequires': `Connector Requires`,
    'fieldSelection.table.label.connectorRequiresLocation': `Connector Requires Location`,
    'fieldSelection.table.label.coreMetadata': `Core Metadata`,
    'fieldSelection.table.label.currentDocument': `Current Document`,
    'fieldSelection.table.label.currentValue': `Current Value`,
    'fieldSelection.table.label.desiredDepth': `Desired Depth`,
    'fieldSelection.table.label.groupByKey': `Group By Key`,
    'fieldSelection.table.label.partitionKey': `Partition Key`,
    'fieldSelection.table.label.userDefined': `User Defined`,
    'fieldSelection.table.label.userRequires': `User Requires`,
    'fieldSelection.table.label.unknown': `Unknown`,
    'fieldSelection.table.label.translated.fieldRequired': `field is required`,
    'fieldSelection.table.label.translated.locationRequired': `location is required`,
    'fieldSelection.table.label.translated.locationRecommended': `location is recommended`,
    'fieldSelection.table.label.translated.fieldOmitted': `field is omitted`,
    'fieldSelection.table.label.translated.fieldOptional': `field is optional`,
    'fieldSelection.table.label.translated.fieldForbidden': `field is forbidden`,
    'fieldSelection.table.label.translated.incompatible': `field is incompatible`,
    'fieldSelection.table.label.filter': `Filter fields`,
    'fieldSelection.table.tooltip.disabledRowAction': `Action disabled: {reason}.`,
    'fieldSelection.massActionMenu.depthZero.label': `Required Only`,
    'fieldSelection.massActionMenu.depthZero.description': `Select only required fields`,
    'fieldSelection.massActionMenu.depthOne.label': `Depth 1`,
    'fieldSelection.massActionMenu.depthOne.description': `Select all top-level fields`,
    'fieldSelection.massActionMenu.depthTwo.label': `Depth 2`,
    'fieldSelection.massActionMenu.depthTwo.description': `Select fields at levels one and two`,
    'fieldSelection.massActionMenu.depthUnlimited.label': `Unlimited Depth`,
    'fieldSelection.massActionMenu.depthUnlimited.description': `Select all fields`,
    'fieldSelection.massActionMenu.description.numeric': `Fields within {depth} {depth, plural, one {level} other {levels}} will currently be selected.`,
    'fieldSelection.massActionMenu.description.unlimited': `All fields will currently be selected.`,
    'fieldSelection.massActionMenu.description.zero': `Only required fields will currently be selected.`,
    'fieldSelection.massActionMenu.header': `Selection Modes`,
    'fieldSelection.reviewDialog.header': `Review Field Selections`,
    'fieldSelection.reviewDialog.description': `Review how the algorithm will impact your field selections.`,
    'fieldSelection.reviewDialog.label.exclude': `Exclude: {count}`,
    'fieldSelection.reviewDialog.label.require': `Require: {count}`,
    'fieldSelection.reviewDialog.label.select': `Select: {count}`,
    'fieldSelection.reviewDialog.label.unselected': `Unselected: {count}`,
    'fieldSelection.outcomeButton.reject.header': `This field will be excluded because:`,
    'fieldSelection.outcomeButton.reject.header.conflict': `A reason to exclude this field is:`,
    'fieldSelection.outcomeButton.select.header': `This field will be included because:`,
    'fieldSelection.outcomeButton.select.header.conflict': `A reason to include this field is:`,
    'fieldSelection.outcomeButton.tooltip': `Click to view outcome`,
    'fieldSelection.outcomeButton.tooltip.conflict': `Click to review conflict`,

    // Messages from binding editing
    'updateBinding.error.noBinding': `Unable to update the proper binding. Contact Support.`,

    // Time Travel
    'notBeforeNotAfter.header': `Time Travel`,
    'notBeforeNotAfter.message': `Include only data from before or after a specific time period. This should only be used when first setting up your destination or it will not have an effect.`,
    'notBeforeNotAfter.update.error': `Changes to draft not saved.`,
    'notAfter.input.label': `Not After`,
    'notAfter.input.description': `only include data from before this time (UTC)`,
    'notBefore.input.label': `Not Before`,
    'notBefore.input.description': `only include data from after this time (UTC)`,

    'specPropEditor.update.error': `Changes to draft not saved.`,
    'specPropEditor.error.cta': `Remove Setting`,

    // Incompatible Schema Change
    'incompatibleSchemaChange.header': `Incompatible Schema Change`,
    'incompatibleSchemaChange.message': `The action to take when a schema change is rejected due to incompatibility. If blank, the binding will backfill and be re-materialized.`,
    'incompatibleSchemaChange.message.specificationSetting': `The action to take when a schema change is rejected due to incompatibility. If blank, all bindings will backfill and be re-materialized.`,
    'incompatibleSchemaChange.error.bindingSettingUpdateFailed': `There was an issue updating the incompatible schema change action for one or more bindings associated with collection, {collection}.`,
    'incompatibleSchemaChange.input.label': `Action on rejected schema change`,

    'incompatibleSchemaChange.error.message': `The current setting "{currentSetting}" does not match a known option. Please update or remove.`,

    'incompatibleSchemaChange.options.abort.label': `Abort`,
    'incompatibleSchemaChange.options.abort.description': `Fail the publication of the incompatible schema change. This prevents any schema change from being applied if it is incompatible with the existing schema, as determined by the connector.`,

    'incompatibleSchemaChange.options.backfill.label': `Backfill`,
    'incompatibleSchemaChange.options.backfill.description': `Increment the backfill counter of the binding, causing it to start over from the beginning.`,

    'incompatibleSchemaChange.options.disableBinding.label': `Disable Binding`,
    'incompatibleSchemaChange.options.disableBinding.description': `Disable the binding, which will be effectively excluded from the task until it is re-enabled.`,

    'incompatibleSchemaChange.options.disableTask.label': `Disable Task`,
    'incompatibleSchemaChange.options.disableTask.description': `Disable the entire task, preventing it from running until it is re-enabled.`,

    // Source Settings
    'workflows.sourceCapture.optionalSettings.header': `Default Collection Settings`,
    'workflows.sourceCapture.optionalSettings.deltaUpdates.control': `Enable delta updates on newly added collections`,
    'workflows.sourceCapture.optionalSettings.targetSchema.control': `Infer schema name from linked data source for new collections`,

    // Delta Updates
    'deltaUpdates.message': `Default setting for the "Delta Updates" field of newly adding bindings.`,
    'deltaUpdates.input.label': `Default setting for the "Delta Updates" field of newly adding bindings.`,

    // Schema Mode
    'schemaMode.message': `Default naming convention for how collections map to destination tables and schemas. If blank, prefixes the table name with the non-default second-to-last part of the collection name.`,
    'schemaMode.input.label': `Default Naming Convention`,

    'specPropUpdater.error.message': `The current setting "{currentSetting}" does not match a known option. Please update or remove.`,
    'specPropUpdater.error.message.toggle': `Current setting "{currentSetting}" does not match a known option. Click to reset value.`,

    // Fields Recommended
    'fieldsRecommended.input.label': `Default Field Depth`,

    // These keys are dynamically build in - useSupportedOptions
    'schemaMode.data.table': `Table:`,
    'schemaMode.data.schema': `Schema:`,
    'schemaMode.example.base': `acmeco/{tablePrefix}/orders`,
    'schemaMode.example.tablePrefix': `anvils`,
    'schemaMode.example.public.tablePrefix': `public`,

    'schemaMode.options.prefixNonDefaultSchema.ignored1': `public`,
    'schemaMode.options.prefixNonDefaultSchema.ignored2': `dbo`,

    'schemaMode.options.prefixNonDefaultSchema.label': `Prefix Non-Default Schema`,
    'schemaMode.options.prefixNonDefaultSchema.description': `Prefixes the table name with the second-to-last part of the collection name {highlight} (like {defaultSchema} or {defaultSchema2}). The schema itself is left unspecified.`,
    'schemaMode.options.prefixNonDefaultSchema.description.highlight': `only if it's not the default schema`,
    'schemaMode.options.prefixNonDefaultSchema.example.table': `{tablePrefix}orders`,
    'schemaMode.options.prefixNonDefaultSchema.example.public.table': `orders`,
    'schemaMode.options.prefixNonDefaultSchema.example.schema': `default`,

    'schemaMode.options.prefixSchema.label': `Prefix Schema`,
    'schemaMode.options.prefixSchema.description': `Always prefixes the table name with the second-to-last part of the collection name, regardless of what the schema is. Schema field remains empty, default is used.`,
    'schemaMode.options.prefixSchema.example.table': `{tablePrefix}orders`,
    'schemaMode.options.prefixSchema.example.public.table': `{tablePrefix}orders`,
    'schemaMode.options.prefixSchema.example.schema': `default`,

    'schemaMode.options.withSchema.label': `Mirror Schemas`,
    'schemaMode.options.withSchema.description': `Sets the schema name to the second-to-last part of the collection name, and uses the last part as the table name.`,
    'schemaMode.options.withSchema.example.table': `orders`,
    'schemaMode.options.withSchema.example.schema': `{tablePrefix}`,

    'schemaMode.options.noSchema.label': `Use Table Name Only`,
    'schemaMode.options.noSchema.description': `Only uses the last part of the collection name as the table name. Schema is left empty, default schema is used.`,
    'schemaMode.options.noSchema.example.table': `orders`,
    'schemaMode.options.noSchema.example.schema': `default`,

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
    'entityCreate.bindingsConfig.noRowsTitle.capture': `Nothing found`,
    'entityCreate.bindingsConfig.noRows.capture': `No bindings were discovered, please check your credentials`,
    'entityCreate.bindingsConfig.noResults': `No results found.`,
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
    'entityEvolution.error.message': `Click '${CTAs['cta.evolve']}' below to accept changes which will automatically re-version and backfill your collections.`,
    'entityEvolution.error.note': `Note: This may result in additional costs as collections are backfilled.`,

    'entityEvolution.action.resetCollection.help': `This will delete your current collection and re-create it with the same name, performing a full backfill from the source system.`,
    'entityEvolution.action.fallThrough.help': `The materializations will be updated to increment the ''backfill'' property of the affected binding, which causes it to re-create destination resources (such as tables) and re-materialize the source collection from the beginning. Other bindings in the materialization will not be affected. The source collection will retain all current data.`,

    'entityEvolution.action.reason.keyChange': 'Collection key modified',
    'entityEvolution.action.reason.partitionChange':
        'Collection partition modified',
    'entityEvolution.action.reason.authoritativeSourceSchema':
        'Collection with same name has already been created and deleted',
    'entityEvolution.action.reason.fallThrough':
        'Incompatible with Materialization',

    // Entities Hydrator
    'entitiesHydrator.error.failedToFetch': `There was an issue while checking if you have any roles.`,
    'storageMappingsHydrator.error.failedToFetch': `There was an issue while checking if you have any storage mappings.`,
    'dataPlanesHydrator.error.failedToFetch': `There was an issue while checking if you have any data planes.`,

    // Entity Not Found
    'entityNotFound.heading': `Sorry, that entity cannot be found.`,
    'entityNotFound.message.default': `The entity you are looking for`,
    'entityNotFound.detail': `was unable to be found.`,
    'entityNotFound.explanation': `This is likely because it has been deleted or you do not have access.`,

    // Entity Status
    'entityStatus.green': `Running`,
    'entityStatus.yellow': `Alerts`,
    'entityStatus.red': `Stopped`,

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
    'schemaEditor.editing.disabled.title': `Editing disabled`,
    'schemaEditor.editing.disabled.message': `To edit collections, disable "${optIntoDiscovery}" under "${autoDiscoverHeader}"`,

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
    'logs.default': `waiting`,
    'logs.paused': `paused`,
    'logs.noLogs': `stopped checking for logs`,
    'logs.restartLink': `click here`,
    'logs.tooManyEmpty': `Logs for this build may have ended. {restartCTA} to start waiting for new logs again.`,
    'logs.networkFailure': `We encountered a problem streaming logs. Please check your network connection and {restartCTA} to start waiting for new logs again.`,

    // Projections
    'projection.dialog.add.header': `Alternate Name`,
    'projection.dialog.add.message': `Add a projection to rename a field in all associated materializations.  After adding a projection, backfill the materialization to ensure it is populated with historical data.`,
    'projection.error.input.invalidFieldName': `Field names cannot begin with a forward slash (/).`,
    'projection.error.alert.removalFailure': `Failed to update the server when removing field alias. Please try again.`,
    'projection.label.fieldName.current': `Current Name`,
    'projection.label.fieldName.new': `New Name`,
    'projection.tooltip.systemDefinedField': `The system-defined alias for this location.`,

    'schemaManagement.options.manual.description': `You fully control the schema. You're responsible for changes.`,
    'schemaManagement.options.manual.label': `Manually manage schemas`,
    'schemaManagement.options.auto.description': `Estuary infers the schema based on the data. With automatically handle changes.`,
    'schemaManagement.options.auto.label': `Let Estuary control schemas`,
};
