import { EntityStatusResponse } from 'deps/control-plane/types';
import { DateTime } from 'luxon';

export interface EntityStatusState {
    response: EntityStatusResponse | null;
    format: 'code' | 'dashboard';
    lastUpdated: DateTime | null;
    setFormat: (
        value: EntityStatusState['format'],
        invertedValue: EntityStatusState['format']
    ) => void;
    setLastUpdated: (value: EntityStatusState['lastUpdated']) => void;
    setResponse: (value: EntityStatusResponse) => void;
}
