import { EntityStatusResponse } from 'deps/control-plane/types';
import { DateTime } from 'luxon';
import { StoreWithHydration } from 'stores/extensions/Hydration';
import { BaseComponentProps } from 'types';

interface ApiError {
    message: string;
    error?: string;
    status?: number;
}

export interface EntityStatusState extends StoreWithHydration {
    format: 'code' | 'dashboard';
    lastUpdated: DateTime | null;
    loading: boolean;
    getSingleResponse: (
        catalogName: string
    ) => EntityStatusResponse | undefined;
    resetState: () => void;
    responses: EntityStatusResponse[] | null;
    serverError: ApiError | null;
    setFormat: (
        value: EntityStatusState['format'],
        invertedValue: EntityStatusState['format']
    ) => void;
    setLastUpdated: (value: EntityStatusState['lastUpdated']) => void;
    setLoading: (value: EntityStatusState['loading']) => void;
    setResponses: (value: EntityStatusResponse[] | undefined) => void;
    setServerError: (value: EntityStatusState['serverError']) => void;
}

export interface HydratorProps extends BaseComponentProps {
    catalogName: string;
}
