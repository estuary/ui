import type { BaseComponentProps } from 'types';

export interface HydratorProps extends BaseComponentProps {
    catalogName: string;
    isCollection: boolean;
}
