import { JsonFormsCore } from '@jsonforms/core';

export enum ActionType {
    CAPTURE_SPEC_CHANGED = 'Capture Spec Changed',
    DETAILS_CHANGED = 'Details Changed',
    ENDPOINT_CHANGED_SPEC = 'Spec Endpoint Changed',
    ENDPOINT_CHANGED_SUBMIT = 'Discovery Endpoint Changed',
}
export type Action =
    | {
          type: ActionType.DETAILS_CHANGED;
          payload: Pick<JsonFormsCore, 'data' | 'errors'>;
      }
    | {
          type: ActionType.ENDPOINT_CHANGED_SUBMIT;
          payload: string;
      }
    | {
          type: ActionType.ENDPOINT_CHANGED_SPEC;
          payload: string;
      }
    | {
          type: ActionType.CAPTURE_SPEC_CHANGED;
          payload: Pick<JsonFormsCore, 'data' | 'errors'>;
      };

export type NewCaptureStateType = {
    details: Pick<JsonFormsCore, 'data' | 'errors'>;
    endpoints: {
        spec: string;
        submit: string;
    };
    spec: Pick<JsonFormsCore, 'data' | 'errors'>;
};

export const NewCaptureDetailsInitState: NewCaptureStateType = {
    details: {
        data: { name: '', image: '' },
        errors: [],
    },
    endpoints: {
        spec: '',
        submit: '',
    },
    spec: {
        data: {},
        errors: [],
    },
};

export const newCaptureReducer = (
    state: NewCaptureStateType,
    action: Action
): NewCaptureStateType => {
    console.log('Reducer', action.type);
    switch (action.type) {
        case ActionType.ENDPOINT_CHANGED_SUBMIT:
            return {
                ...state,
                endpoints: {
                    ...state.endpoints,
                    submit: action.payload,
                },
            };
        case ActionType.ENDPOINT_CHANGED_SPEC:
            return {
                ...state,
                endpoints: {
                    ...state.endpoints,
                    spec: action.payload,
                },
            };
        case ActionType.DETAILS_CHANGED:
            return {
                ...state,
                details: action.payload,
            };
        case ActionType.CAPTURE_SPEC_CHANGED:
            return {
                ...state,
                spec: action.payload,
            };
        default:
            throw new Error();
    }
};
