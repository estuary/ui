import { EntityStatusResponse } from 'deps/control-plane/types';
import { DateTime } from 'luxon';
import { StoreWithHydration } from 'stores/extensions/Hydration';

export interface EntityStatusState extends StoreWithHydration {
    responses: EntityStatusResponse[] | null;
    format: 'code' | 'dashboard';
    lastUpdated: DateTime | null;
    loading: boolean;
    getSingleResponse: (
        catalogName: string
    ) => EntityStatusResponse | undefined;
    resetState: () => void;
    setFormat: (
        value: EntityStatusState['format'],
        invertedValue: EntityStatusState['format']
    ) => void;
    setLastUpdated: (value: EntityStatusState['lastUpdated']) => void;
    setLoading: (value: EntityStatusState['loading']) => void;
    setResponses: (value: EntityStatusResponse[]) => void;
}
