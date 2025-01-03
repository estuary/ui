import { ReactNode } from 'react';
import { BaseComponentProps } from 'types';

export interface BaseDetailProps {
    headerMessageId: string;
}

export interface DetailWrapperProps extends BaseComponentProps {
    headerMessageId: string;
    Loading?: ReactNode;
}
