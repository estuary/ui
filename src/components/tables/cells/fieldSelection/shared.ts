import { RejectReason, SelectReason } from 'src/types/wasm';

export const TOGGLE_BUTTON_CLASS = 'toggle-button';

export const fieldOutcomeMessages: {
    [reason: string]: { id: string; translatedId: string };
} = {
    [RejectReason.COLLECTION_OMITS]: {
        id: 'fieldSelection.table.label.collectionOmits',
        translatedId: '',
    },
    [RejectReason.CONNECTOR_FORBIDS]: {
        id: 'fieldSelection.table.label.connectorForbids',
        translatedId: 'fieldSelection.table.label.translated.fieldForbidden',
    },
    [RejectReason.CONNECTOR_OMITS]: {
        id: 'fieldSelection.table.label.connectorOmits',
        translatedId: 'fieldSelection.table.label.translated.fieldOmitted',
    },
    [RejectReason.CONNECTOR_INCOMPATIBLE]: {
        id: 'fieldSelection.table.label.connectorIncompatible',
        translatedId: 'fieldSelection.table.label.translated.incompatible',
    },
    [RejectReason.COVERED_LOCATION]: {
        id: 'fieldSelection.table.label.coveredLocation',
        translatedId: '',
    },
    [RejectReason.DUPLICATE_FOLD]: {
        id: 'fieldSelection.table.label.duplicateFold',
        translatedId: '',
    },
    [RejectReason.DUPLICATE_LOCATION]: {
        id: 'fieldSelection.table.label.duplicateLocation',
        translatedId: '',
    },
    [RejectReason.EXCLUDED_PARENT]: {
        id: 'fieldSelection.table.label.excludedParent',
        translatedId: '',
    },
    [RejectReason.NOT_SELECTED]: {
        id: 'fieldSelection.table.label.notSelected',
        translatedId: 'fieldSelection.table.label.translated.fieldOptional',
    },
    [RejectReason.USER_EXCLUDES]: {
        id: 'fieldSelection.table.label.userExcludes',
        translatedId: '',
    },
    [SelectReason.CONNECTOR_REQUIRES]: {
        id: 'fieldSelection.table.label.connectorRequires',
        translatedId: 'fieldSelection.table.label.translated.fieldRequired',
    },
    [SelectReason.CONNECTOR_REQUIRES_LOCATION]: {
        id: 'fieldSelection.table.label.connectorRequiresLocation',
        translatedId: 'fieldSelection.table.label.translated.fieldRequired',
    },
    [SelectReason.CORE_METADATA]: {
        id: 'fieldSelection.table.label.coreMetadata',
        translatedId: '',
    },
    [SelectReason.CURRENT_DOCUMENT]: {
        id: 'fieldSelection.table.label.currentDocument',
        translatedId: 'fieldSelection.table.label.translated.fieldRequired',
    },
    [SelectReason.CURRENT_VALUE]: {
        id: 'fieldSelection.table.label.currentValue',
        translatedId: '',
    },
    [SelectReason.DESIRED_DEPTH]: {
        id: 'fieldSelection.table.label.desiredDepth',
        translatedId: '',
    },
    [SelectReason.GROUP_BY_KEY]: {
        id: 'fieldSelection.table.label.groupByKey',
        translatedId: 'fieldSelection.table.label.translated.fieldRequired',
    },
    [SelectReason.PARTITION_KEY]: {
        id: 'fieldSelection.table.label.partitionKey',
        translatedId: 'fieldSelection.table.label.translated.fieldRequired',
    },
    [SelectReason.USER_DEFINED]: {
        id: 'fieldSelection.table.label.userDefined',
        translatedId: '',
    },
    [SelectReason.USER_REQUIRES]: {
        id: 'fieldSelection.table.label.userRequires',
        translatedId: '',
    },
};
