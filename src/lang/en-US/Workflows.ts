import {
    CommonMessages,
    endpointConfigHeader,
} from 'src/lang/en-US/CommonMessages';
import { CTAs } from 'src/lang/en-US/CTAs';

const trialDuration = import.meta.env.VITE_TRIAL_DURATION;

// TODO (optimization): Consolidate duplicate create and edit messages.
export const Workflows: Record<string, string> = {
    'workflows.error.endpointConfig.empty': `${endpointConfigHeader} empty`,
    'workflows.error.initForm': `An issue was encountered initializing the form.`,

    'workflows.error.oldBoundCollection.added': `Your account uses Estuary's Trial bucket which includes ${trialDuration} days of storage and this collection is older than that. To ensure you have all data, please also backfill this collection from the source after adding it to the materialization.`,
    'workflows.error.oldBoundCollection.backfillAll': `Your account uses Estuary's Trial bucket which includes ${trialDuration} days of storage. There are collections bound to this materialization that are older than that.`,
    'workflows.error.oldBoundCollection.backfill': `Your account uses Estuary's Trial bucket which includes ${trialDuration} days of storage and this collection is older than that. Data will be missing if you backfill from the materialization so we recommend backfilling from the source.`,

    'workflows.initTask.alert.message.initFailed': `An issue was encountered initializing the form. Try refreshing the page and if the issue persists {docLink}.`,
    'workflows.initTask.alert.message.initFailed.docLink': `${CTAs['cta.support']}`,
    'workflows.initTask.alert.message.initFailed.docPath': `${CommonMessages['support.email']}`,
    'workflows.initTask.alert.message.patchedSpec': `An issue was encountered recovering your changes. The latest, published record of the task was used to initialize the form.`,

    'workflows.collectionSelector.error.message.invalidPubId': `This specification may have diverged from the latest, published record of the collection. Your unpublished changes can be found in the editor.`,
    'workflows.collectionSelector.error.message.draftCreationFailed': `The latest, published record of the collection can be found in the editor. It is read-only.`,

    'workflows.collectionSelector.tab.collectionSchema': `Collection`,
    'workflows.collectionSelector.tab.resourceConfig': `Config`,

    'workflows.collectionSelector.toggle.enable.tooltip': `Enable all {itemType} in the list below`,
    'workflows.collectionSelector.toggle.disable.tooltip': `Disable all {itemType} in the list below`,

    'workflows.collectionSelector.notifications.toggle.enable': `{count} {itemType} enabled`,
    'workflows.collectionSelector.notifications.toggle.disable': `{count} {itemType} disabled`,

    'workflows.collectionSelector.schemaEdit.description': `Use the commands below to edit the schema for this collection. Once executed, click the Synchronize Schema button below to pull the changes on the server into the UI.`,

    'workflows.collectionSelector.manualBackfill.notSupported.message': `Please {docLink} for help with a backfill.`,
    'workflows.collectionSelector.manualBackfill.notSupported.message.docLink': `${CTAs['cta.support']}`,
    'workflows.collectionSelector.manualBackfill.notSupported.message.docPath': `${CommonMessages['support.email']}`,

    'workflows.collectionSelector.manualBackfill.error.title': `Backfill update failed`,
    'workflows.collectionSelector.manualBackfill.error.message.singleCollection': `There was an issue updating the backfill counter for one or more bindings associated with collection, {collection}.`,
    'workflows.collectionSelector.manualBackfill.error.message.allBindings': `There was an issue updating the backfill counter for one or more bindings.`,

    'workflows.autoDiscovery.update.failed': `Schema evolution update failed`,

    'workflows.disable.autoEnabledAlert.instructions': `To keep the {entityType} disabled you will need to disable before publishing.`,

    'workflows.dataFlowBackfill.options.reset.description': `Backfill data from the source, reset inferred schemas, drop and re-create all destination tables and derivations.`,

    'workflows.dataFlowBackfill.options.incremental.description': `Re-extract all source data and Insert or Append into your existing destination tables without dropping and recreating them.`,

    'workflows.dataPlane.description': `Choose the data plane you would like to use.`,

    // Field Selection

    'fieldSelection.table.label': `Field Selection Editor`,
    'fieldSelection.message': `Determine which fields in your collection get materialized. By default, the connector dynamically selects the fields exported by your materialization. Click "${CTAs['cta.refresh']}" to update the table below. For more details, please {docLink}.`,
    'fieldSelection.message.docLink': `see the docs`,
    'fieldSelection.message.docPath': `https://docs.estuary.dev/guides/customize-materialization-fields/`,

    'fieldSelection.cta.selectAlgorithm': `Field Depth`,

    'fieldSelection.error.serverUpdateFailed': `Field selection update failed`,

    'fieldSelection.table.cta.excludeField': `Exclude`,
    'fieldSelection.table.cta.requireField': `Require`,
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

    'fieldSelection.massActionMenu.depthZero.description': `Select only required fields`,

    'fieldSelection.massActionMenu.depthOne.description': `Select all top-level fields`,

    'fieldSelection.massActionMenu.depthTwo.description': `Select fields at levels one and two`,

    'fieldSelection.massActionMenu.depthUnlimited.description': `Select all fields`,

    'fieldSelection.groupBy.description': `Select an ordered subset of scalar fields which will be grouped over. If not specified, the key of the source collection will be used.`,

    'fieldSelection.groupBy.label.explicitKeys': `The source collection is currently keyed by:`,
    'fieldSelection.groupBy.label.implicitKeys': `The source collection is naturally keyed by:`,

    // Messages from binding editing

    // Time Travel

    'notAfter.input.description': `only include data from before this time (UTC)`,

    'notBefore.input.description': `only include data from after this time (UTC)`,

    // Incompatible Schema Change

    'incompatibleSchemaChange.input.label': `Action on rejected schema change`,

    'incompatibleSchemaChange.options.abort.label': `Abort`,
    'incompatibleSchemaChange.options.abort.description': `Fail the publication of the incompatible schema change. This prevents any schema change from being applied if it is incompatible with the existing schema, as determined by the connector.`,

    'incompatibleSchemaChange.options.backfill.label': `Backfill`,
    'incompatibleSchemaChange.options.backfill.description': `Increment the backfill counter of the binding, causing it to start over from the beginning.`,

    'incompatibleSchemaChange.options.disableBinding.label': `Disable Binding`,
    'incompatibleSchemaChange.options.disableBinding.description': `Disable the binding, which will be effectively excluded from the task until it is re-enabled.`,

    'incompatibleSchemaChange.options.disableTask.label': `Disable Task`,
    'incompatibleSchemaChange.options.disableTask.description': `Disable the entire task, preventing it from running until it is re-enabled.`,

    // Source Settings

    // Delta Updates
    'deltaUpdates.input.label': `Default setting for the "Delta Updates" field of newly adding bindings.`,

    // Destination Layout dialog (new targetNaming model)

    'destinationLayout.dialog.alert': `Set your default naming strategy to continue`,
    'destinationLayout.dialog.title': `Destination Layout`,

    'destinationLayout.dialog.schema.label': `Schema`,
    'destinationLayout.dialog.table.label': `Table`,

    'destinationLayout.dialog.cta.addBindings': `Add Collections`,
    'destinationLayout.dialog.cta.sourceCapture': `Set Source Capture`,

    // Used dynamically in ui/src/components/materialization/targetNaming/StrategyOption.tsx
    'destinationLayout.strategy.matchSourceStructure.label': `Match source structure`,
    'destinationLayout.strategy.matchSourceStructure.description': `Preserve the original table and schema names. Tables keep their original names.`,

    'destinationLayout.strategy.singleSchema.label': `Set a default schema`,
    'destinationLayout.strategy.singleSchema.description': `Place all your tables in one schema. Only the table name is used.`,

    'destinationLayout.strategy.prefixTableNames.label': `Prefix table names`,
    'destinationLayout.strategy.prefixTableNames.description': `The schema name is added as a table name prefix.`,

    // Schema Mode

    'specPropUpdater.error.message': `The current setting "{currentSetting}" does not match a known option. Please update or remove.`,
    'specPropUpdater.error.message.withRemove': `Current setting "{currentSetting}" does not match a known option. Click to reset value.`,

    // Fields Recommended
    'fieldsRecommended.cta.selectAlgorithm': `Default Field Depth`,

    // These keys are dynamically build in - useSupportedOptions
    'schemaMode.example.base': `${CommonMessages['defaults.tenant']}/{tablePrefix}/${CommonMessages['defaults.table']}`,

    'schemaMode.options.prefixNonDefaultSchema.label': `Prefix Non-Default Schema`,
    'schemaMode.options.prefixNonDefaultSchema.description': `Prefixes the table name with the second-to-last part of the collection name {highlight} (like {defaultSchema} or {defaultSchema2}). The schema itself is left unspecified.`,

    'schemaMode.options.prefixNonDefaultSchema.example.table': `{tablePrefix}${CommonMessages['defaults.table']}`,
    'schemaMode.options.prefixNonDefaultSchema.example.public.table': `${CommonMessages['defaults.table']}`,
    'schemaMode.options.prefixNonDefaultSchema.example.schema': `default`,

    'schemaMode.options.prefixSchema.label': `Prefix Schema`,
    'schemaMode.options.prefixSchema.description': `Always prefixes the table name with the second-to-last part of the collection name, regardless of what the schema is. Schema field remains empty, default is used.`,
    'schemaMode.options.prefixSchema.example.table': `{tablePrefix}${CommonMessages['defaults.table']}`,
    'schemaMode.options.prefixSchema.example.public.table': `{tablePrefix}${CommonMessages['defaults.table']}`,
    'schemaMode.options.prefixSchema.example.schema': `default`,

    'schemaMode.options.withSchema.label': `Mirror Schemas`,
    'schemaMode.options.withSchema.description': `Sets the schema name to the second-to-last part of the collection name, and uses the last part as the table name.`,
    'schemaMode.options.withSchema.example.table': `${CommonMessages['defaults.table']}`,
    'schemaMode.options.withSchema.example.schema': `{tablePrefix}`,

    'schemaMode.options.noSchema.label': `Use Table Name Only`,
    'schemaMode.options.noSchema.description': `Only uses the last part of the collection name as the table name. Schema is left empty, default schema is used.`,
    'schemaMode.options.noSchema.example.table': `${CommonMessages['defaults.table']}`,
    'schemaMode.options.noSchema.example.schema': `default`,

    // Entities Create

    'entityCreate.sops.failedTitle': `Configuration Encryption Failed`,

    'entityCreate.endpointConfig.errorSummary': `There are issues with the form.`,
    'entityCreate.instructions': `To start select a Connector below. Once you make a selection the rest of the form will display and you can configure your endpoint. You can search by name and if you do not find what you are looking for please let us know by requesting the connector.`,

    'entityCreate.endpointConfig.resourceConfigHaveErrors': `The Collections section has errors:`,
    'entityCreate.endpointConfig.endpointConfigHaveErrors': `The ${endpointConfigHeader} section has errors:`,

    'entityCreate.endpointConfig.collectionsMissing': `${CommonMessages['terms.collections']} missing`,

    'entityCreate.bindingsConfig.noRows': `Start by clicking the 'add' button above and selecting what you want to`,
    'entityCreate.bindingsConfig.noRowsTitle': `No selection made`,
    'entityCreate.bindingsConfig.noRowsTitle.capture': `Nothing found`,
    'entityCreate.bindingsConfig.noRows.capture': `No bindings were discovered, please check your credentials`,

    'entityCreate.errors.missingDraftId': `Missing Draft ID.`,

    'discovery.failed.title': `Generating Specification Failed`,
    'discovery.failed.message': `There was an issue attempting to discover your endpoint. Please review details below.`,

    // Entity Edit

    // Entity Evolution
    'entityEvolution.failure.errorTitle': `Update Failed`,
    'entityEvolution.serverUnreachable': `${CommonMessages['common.failedFetch']} while trying to update collections`,

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

    // Entity Not Found

    // Docs
    'docs.iframe.title': `{connector} Documentation`,

    'docs.iframe.disabled.message': `We cannot open 3rd party documentation inline. To view you must open {docLink} in a new window.`,
    'docs.iframe.disabled.message.docLink': `connector help`,

    // Schema Editor for Collections

    'schemaEditor.table.empty.header': `No fields to display.`,
    'schemaEditor.table.empty.message': `We were unable to generate a table from the current schema. Please update the schema.`,
    'schemaEditor.table.empty.filtered.message': `This schema does not contain these kind of fields.`,

    // Task Endpoints

    'taskEndpoint.link.public.label': 'Public endpoint: ',
    'taskEndpoint.link.private.label': 'Private endpoint: ',
    'taskEndpoint.visibility.public.tooltip':
        'Public: anyone may access this port over the public internet',
    'taskEndpoint.visibility.private.tooltip':
        'Private: access to this port is restricted to authenticated users who have "admin" permissions to the task',

    // Logs Dialog
    'logs.default': `waiting`,
    'logs.paused': `paused`,

    'logs.tooManyEmpty': `Logs for this build may have ended. {restartCTA} to start waiting for new logs again.`,
    'logs.networkFailure': `We encountered a problem streaming logs. Please check your network connection and {restartCTA} to start waiting for new logs again.`,

    // Projections

    'projection.error.alert.duplicate': `Field name already in use for "{duplicateLocation}"`,

    'projection.option.block.label': `Block`,
    'projection.option.sha256.label': `Hash`,
    'projection.option.block.description': `Prevent this field from being captured into your collection.`,
    'projection.option.sha256.description': `Hash this field's value before storing it in your collection.`,

    'schemaManagement.options.manual.description': `You fully control the schema. You're responsible for changes.`,

    'schemaManagement.options.auto.description': `Estuary infers the schema based on the data. With automatically handle changes.`,
};
