import { EntityStatusResponse } from 'deps/control-plane/types';
import { DateTime } from 'luxon';

export interface EntityStatusState {
    responses: EntityStatusResponse[] | null;
    format: 'code' | 'dashboard';
    lastUpdated: DateTime | null;
    getLoading: () => boolean;
    getSingleResponse: (
        catalogName: string
    ) => EntityStatusResponse | undefined;
    resetState: () => void;
    setFormat: (
        value: EntityStatusState['format'],
        invertedValue: EntityStatusState['format']
    ) => void;
    setLastUpdated: (value: EntityStatusState['lastUpdated']) => void;
    setResponses: (value: EntityStatusResponse[]) => void;
}
