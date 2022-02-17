import { JsonFormsCore } from '@jsonforms/core';
import produce from 'immer';

export enum ActionType {
    CAPTURE_SPEC_CHANGED = 'Capture Spec Changed',
    DETAILS_CHANGED = 'Details Changed',
    CONNECTOR_CHANGED = 'Connector Changed',
    NEW_SPEC_LINK = 'Spec Endpoint Changed',
    NEW_DISCOVERY_LINK = 'Discovery Endpoint Changed',
    NEW_CONNECTOR_LINK = 'Connector Image Endpoint Changed',
    NEW_DOCS_LINK = 'Documentation Link Changed',
}

export type NewCaptureStateType = {
    details: Pick<JsonFormsCore, 'data' | 'errors'>;
    links: {
        connectorImage: string;
        discovery: string;
        documentation: string;
        spec: string;
    };
    spec: Pick<JsonFormsCore, 'data' | 'errors'>;
};

export type Action =
    | {
          type: ActionType.DETAILS_CHANGED;
          payload: NewCaptureStateType['details'];
      }
    | {
          type: ActionType.NEW_DISCOVERY_LINK;
          payload: NewCaptureStateType['links']['discovery'];
      }
    | {
          type: ActionType.NEW_CONNECTOR_LINK;
          payload: NewCaptureStateType['links']['connectorImage'];
      }
    | {
          type: ActionType.CONNECTOR_CHANGED;
          payload: NewCaptureStateType['links']['connectorImage'];
      }
    | {
          type: ActionType.NEW_DOCS_LINK;
          payload: NewCaptureStateType['links']['documentation'];
      }
    | {
          type: ActionType.NEW_SPEC_LINK;
          payload: NewCaptureStateType['links']['spec'];
      }
    | {
          type: ActionType.CAPTURE_SPEC_CHANGED;
          payload: NewCaptureStateType['spec'];
      };

export const getInitialState = (): NewCaptureStateType => {
    return {
        details: {
            data: { name: '', image: '' },
            errors: [],
        },
        links: {
            connectorImage: '',

            discovery: '',
            documentation: '',
            spec: '',
        },
        spec: {
            data: {},
            errors: [],
        },
    };
};

export const newCaptureReducer = (
    state: NewCaptureStateType,
    action: Action
): NewCaptureStateType => {
    switch (action.type) {
        // Links
        case ActionType.NEW_DISCOVERY_LINK:
            return produce(state, (draft: NewCaptureStateType) => {
                draft.links.discovery = action.payload;
            });
        case ActionType.NEW_SPEC_LINK:
            return produce(state, (draft: NewCaptureStateType) => {
                draft.links.spec = action.payload;
            });
        case ActionType.NEW_CONNECTOR_LINK:
            return produce(state, (draft: NewCaptureStateType) => {
                draft.links = getInitialState().links;
                draft.links.connectorImage = action.payload;
            });
        case ActionType.NEW_DOCS_LINK:
            return produce(state, (draft: NewCaptureStateType) => {
                draft.links.documentation = action.payload;
            });

        // Forms
        case ActionType.DETAILS_CHANGED:
            return produce(state, (draft: NewCaptureStateType) => {
                draft.details = action.payload;

                draft.details.errors = draft.details.errors
                    ? draft.details.errors
                    : [];
            });
        case ActionType.CAPTURE_SPEC_CHANGED:
            return produce(state, (draft: NewCaptureStateType) => {
                draft.spec = action.payload;

                draft.spec.errors = draft.spec.errors ? draft.spec.errors : [];
            });

        // Connector (needs to reset most things)
        case ActionType.CONNECTOR_CHANGED:
            return produce(state, (draft: NewCaptureStateType) => {
                draft.links = getInitialState().links;
                draft.spec = getInitialState().spec;

                draft.details.data.image = action.payload;
                draft.links.connectorImage = action.payload;
            });
        default:
            throw new Error();
    }
};
