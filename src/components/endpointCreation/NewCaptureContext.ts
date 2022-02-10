import React, { Dispatch } from 'react';
import { Action, NewCaptureStateType } from './NewCaptureReducer';

interface IContextProps {
    state: NewCaptureStateType;
    dispatch: Dispatch<Action>;
}

const NewCaptureContext = React.createContext({} as IContextProps);

export function useNewCaptureContext() {
    return React.useContext(NewCaptureContext);
}

export default NewCaptureContext;
