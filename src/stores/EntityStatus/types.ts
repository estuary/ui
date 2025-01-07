import { EntityStatusResponse } from 'deps/control-plane/types';

export interface EntityStatusState {
    response: EntityStatusResponse | null;
    setResponse: (value: EntityStatusResponse) => void;

    format: 'code' | 'dashboard';
    setFormat: (
        value: EntityStatusState['format'],
        invertedValue: EntityStatusState['format']
    ) => void;
}
