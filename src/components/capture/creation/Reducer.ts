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

export interface NewCaptureState {
    details: Pick<JsonFormsCore, 'data' | 'errors'>;
    links: {
        connectorImage: string;
        discovered_catalog: string;
        documentation: string;
        spec: string;
    };
    spec: Pick<JsonFormsCore, 'data' | 'errors'>;
}

export type Action =
    | {
          type: ActionType.DETAILS_CHANGED;
          payload: NewCaptureState['details'];
      }
    | {
          type: ActionType.NEW_DISCOVERY_LINK;
          payload: NewCaptureState['links']['discovered_catalog'];
      }
    | {
          type: ActionType.NEW_CONNECTOR_LINK;
          payload: NewCaptureState['links']['connectorImage'];
      }
    | {
          type: ActionType.CONNECTOR_CHANGED;
          payload: NewCaptureState['links']['connectorImage'];
      }
    | {
          type: ActionType.NEW_DOCS_LINK;
          payload: NewCaptureState['links']['documentation'];
      }
    | {
          type: ActionType.NEW_SPEC_LINK;
          payload: NewCaptureState['links']['spec'];
      }
    | {
          type: ActionType.CAPTURE_SPEC_CHANGED;
          payload: NewCaptureState['spec'];
      };

export const getInitialState = (): NewCaptureState => {
    return {
        details: {
            data: { image: '', name: '' },
            errors: [],
        },
        links: {
            connectorImage: '',
            discovered_catalog: '',
            documentation: '',
            spec: '',
        },
        spec: {
            data: {},
            errors: [],
        },
    };
};

export const newCaptureReducer = (state: NewCaptureState, action: Action) => {
    return produce(state, (draft) => {
        switch (action.type) {
            // Links
            case ActionType.NEW_DISCOVERY_LINK:
                draft.links.discovered_catalog = action.payload;
                break;

            case ActionType.NEW_SPEC_LINK:
                draft.links.spec = action.payload;
                break;

            case ActionType.NEW_CONNECTOR_LINK:
                draft.links = getInitialState().links;
                draft.links.connectorImage = action.payload;
                break;

            case ActionType.NEW_DOCS_LINK:
                draft.links.documentation = action.payload;
                break;

            // Forms
            case ActionType.DETAILS_CHANGED:
                draft.details = action.payload;
                break;

            case ActionType.CAPTURE_SPEC_CHANGED:
                draft.spec = action.payload;
                break;

            // Connector (needs to reset most things)
            case ActionType.CONNECTOR_CHANGED:
                draft.links = getInitialState().links;
                draft.spec = getInitialState().spec;

                draft.details.data.image = action.payload;
                draft.links.connectorImage = action.payload;
                break;

            default:
                throw new Error();
        }
    });
};
