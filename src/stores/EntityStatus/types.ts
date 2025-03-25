import type { DateTime } from 'luxon';
import type { StoreWithHydration } from 'stores/extensions/Hydration';
import type { KeyedMutator } from 'swr';
import type { BaseComponentProps } from 'types';
import type { EntityStatusResponse } from 'types/controlPlane';

interface ApiError {
    message: string;
    error?: string;
    status?: number;
}

export interface EntityStatusState extends StoreWithHydration {
    format: 'code' | 'dashboard';
    lastUpdated: DateTime | null;
    refresh: () => Promise<EntityStatusResponse[] | undefined>;
    resetState: () => void;
    responses: EntityStatusResponse[] | null;
    serverError: ApiError | null;
    setFormat: (
        value: EntityStatusState['format'],
        invertedValue: EntityStatusState['format']
    ) => void;
    setLastUpdated: (value: EntityStatusState['lastUpdated']) => void;
    setRefresh: (value: KeyedMutator<EntityStatusResponse[]>) => void;
    setResponses: (value: EntityStatusResponse[] | undefined) => void;
    setServerError: (value: EntityStatusState['serverError']) => void;
}

export interface HydratorProps extends BaseComponentProps {
    catalogName: string;
}
