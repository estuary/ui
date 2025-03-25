import type { ReactNode } from 'react';
import type { BaseComponentProps } from 'types';
import type { AutoDiscoverOutcome } from 'types/controlPlane';
import type { StatusIndicatorState } from 'utils/entityStatus-utils';

export interface AutoDiscoverChangesProps {
    added: AutoDiscoverOutcome['added'];
    modified: AutoDiscoverOutcome['modified'];
    removed: AutoDiscoverOutcome['removed'];
}

export interface BaseDetailProps {
    headerMessageId: string;
}

export interface DetailWrapperProps extends BaseComponentProps {
    headerMessageId: string;
    Hydrating?: ReactNode;
}

export interface NumericDetailProps extends BaseDetailProps {
    value: number;
}

export interface StatusIndicatorProps {
    status: StatusIndicatorState;
}

export interface TimestampDetailProps extends BaseDetailProps {
    time: string | undefined;
}
