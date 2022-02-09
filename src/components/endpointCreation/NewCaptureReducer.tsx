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
    spec: Pick<JsonFormsCore, 'data' | 'errors'>;
    errors: any[];
};

export const NewCaptureDetailsInitState: NewCaptureStateType = {
    details: {
        name: '',
        image: '',
    },
    spec: {
        data: {} as Pick<JsonFormsCore, 'data'>,
    },
    errors: [],
};

export const newCaptureReducer = (
    state: NewCaptureStateType,
    action: Action
) => {
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
            return { ...state, config: payload.data, errors: payload.errors };
        default:
            throw new Error();
    }
};
