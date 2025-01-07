import { EntityStatusResponse } from 'deps/control-plane/types';
import { DateTime } from 'luxon';

export interface EntityStatusState {
    responses: EntityStatusResponse[] | null;
    format: 'code' | 'dashboard';
    lastUpdated: DateTime | null;
    getSingleResponse: (
        catalogName: string
    ) => EntityStatusResponse | undefined;
    setFormat: (
        value: EntityStatusState['format'],
        invertedValue: EntityStatusState['format']
    ) => void;
    setLastUpdated: (value: EntityStatusState['lastUpdated']) => void;
    setResponses: (value: EntityStatusResponse[]) => void;
}
