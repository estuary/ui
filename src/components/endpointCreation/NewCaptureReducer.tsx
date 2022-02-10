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
    details: Pick<JsonFormsCore, 'data' | 'errors'>;
    spec: Pick<JsonFormsCore, 'data' | 'errors'>;
};

export const NewCaptureDetailsInitState: NewCaptureStateType = {
    details: {
        data: { name: '', image: '' },
        errors: [],
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
    const { payload, type } = action;

    switch (type) {
        case ActionType.DETAILS_CHANGED:
            return {
                ...state,
                details: payload,
            };
        case ActionType.CAPTURE_SPEC_CHANGED:
            return {
                ...state,
                spec: payload,
            };
        default:
            throw new Error();
    }
};
