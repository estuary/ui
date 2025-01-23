import { DateTime } from 'luxon';
import { StoreWithHydration } from 'stores/extensions/Hydration';
import { KeyedMutator } from 'swr';
import { BaseComponentProps } from 'types';
import { EntityStatusResponse } from 'types/controlPlane';

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
