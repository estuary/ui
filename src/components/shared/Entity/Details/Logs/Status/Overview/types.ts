import { ReactNode } from 'react';
import { BaseComponentProps } from 'src/types';
import { AutoDiscoverOutcome } from 'src/types/controlPlane';
import { StatusIndicatorState } from 'src/utils/entityStatus-utils';

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
