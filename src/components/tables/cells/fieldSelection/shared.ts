import { RejectReason, SelectReason } from 'src/types/wasm';

export const TOGGLE_BUTTON_CLASS = 'toggle-button';

export const fieldOutcomeMessages: {
    [reason: string]: { id: string; tooltip: string };
} = {
    [RejectReason.COLLECTION_OMITS]: {
        id: 'fieldSelection.table.label.collectionOmits',
        tooltip: '',
    },
    [RejectReason.CONNECTOR_FORBIDS]: {
        id: 'fieldSelection.table.label.connectorForbids',
        tooltip: 'field is forbidden',
    },
    [RejectReason.CONNECTOR_OMITS]: {
        id: 'fieldSelection.table.label.connectorOmits',
        tooltip: 'field is omitted',
    },
    [RejectReason.CONNECTOR_INCOMPATIBLE]: {
        id: 'fieldSelection.table.label.connectorIncompatible',
        tooltip: 'field is incompatible',
    },
    [RejectReason.COVERED_LOCATION]: {
        id: 'fieldSelection.table.label.coveredLocation',
        tooltip: '',
    },
    [RejectReason.DUPLICATE_FOLD]: {
        id: 'fieldSelection.table.label.duplicateFold',
        tooltip: '',
    },
    [RejectReason.DUPLICATE_LOCATION]: {
        id: 'fieldSelection.table.label.duplicateLocation',
        tooltip: '',
    },
    [RejectReason.EXCLUDED_PARENT]: {
        id: 'fieldSelection.table.label.excludedParent',
        tooltip: '',
    },
    [RejectReason.NOT_SELECTED]: {
        id: 'fieldSelection.table.label.notSelected',
        tooltip: 'field is optional',
    },
    [RejectReason.USER_EXCLUDES]: {
        id: 'fieldSelection.table.label.userExcludes',
        tooltip: '',
    },
    [SelectReason.CONNECTOR_REQUIRES]: {
        id: 'fieldSelection.table.label.connectorRequires',
        tooltip: 'field is required',
    },
    [SelectReason.CONNECTOR_REQUIRES_LOCATION]: {
        id: 'fieldSelection.table.label.connectorRequiresLocation',
        tooltip: 'field is required',
    },
    [SelectReason.CORE_METADATA]: {
        id: 'fieldSelection.table.label.coreMetadata',
        tooltip: '',
    },
    [SelectReason.CURRENT_DOCUMENT]: {
        id: 'fieldSelection.table.label.currentDocument',
        tooltip: 'field is required',
    },
    [SelectReason.CURRENT_VALUE]: {
        id: 'fieldSelection.table.label.currentValue',
        tooltip: '',
    },
    [SelectReason.DESIRED_DEPTH]: {
        id: 'fieldSelection.table.label.desiredDepth',
        tooltip: '',
    },
    [SelectReason.GROUP_BY_KEY]: {
        id: 'fieldSelection.table.label.groupByKey',
        tooltip: 'field is required',
    },
    [SelectReason.PARTITION_KEY]: {
        id: 'fieldSelection.table.label.partitionKey',
        tooltip: 'field is required',
    },
    [SelectReason.USER_DEFINED]: {
        id: 'fieldSelection.table.label.userDefined',
        tooltip: '',
    },
    [SelectReason.USER_REQUIRES]: {
        id: 'fieldSelection.table.label.userRequires',
        tooltip: '',
    },
};
