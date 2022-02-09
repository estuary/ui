import { JsonFormsCore } from '@jsonforms/core';

export enum ActionType {
    CAPTURE_SPEC_CHANGED = 'Capture Spec Changed',
    DETAILS_CHANGED = 'Details Changed',
}
export type Action =
    | {
          type: ActionType.DETAILS_CHANGED;
          payload: Pick<JsonFormsCore, 'data' | 'errors'>;
      }
    | {
          type: ActionType.CAPTURE_SPEC_CHANGED;
          payload: Pick<JsonFormsCore, 'data' | 'errors'>;
      };

export type NewCaptureStateType = {
    details: {
        name: string;
        image: string;
    };
    spec: JsonFormsCore['data'];
    errors: JsonFormsCore['errors'];
};

export const NewCaptureDetailsInitState: NewCaptureStateType = {
    details: {
        name: '',
        image: '',
    },
    spec: {},
    errors: [],
};

export const newCaptureReducer = (
    state: NewCaptureStateType,
    action: Action
): NewCaptureStateType => {
    const { payload, type } = action;

    console.log('New Capture Details Reducer running', action);

    switch (type) {
        case ActionType.DETAILS_CHANGED:
            return {
                ...state,
                details: payload.data,
                errors: payload.errors,
            };
        case ActionType.CAPTURE_SPEC_CHANGED:
            return {
                ...state,
                spec: payload.data,
                errors: payload.errors,
            };
        default:
            throw new Error();
    }
};
