import type { ReactNode } from 'react';
import type { BaseComponentProps } from 'src/types';
import type { AutoDiscoverOutcome } from 'src/types/controlPlane';
import type { StatusIndicatorState } from 'src/utils/entityStatus-utils';

export interface AutoDiscoverChangesProps {
    added: AutoDiscoverOutcome['added'];
    modified: AutoDiscoverOutcome['modified'];
    removed: AutoDiscoverOutcome['removed'];
}

export interface BaseDetailProps {
    header: string;
}

export interface DetailWrapperProps extends BaseComponentProps {
    header: string;
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
