import { BaseComponentProps } from 'src/types';

export interface HydratorProps extends BaseComponentProps {
    catalogName: string;
    isCollection: boolean;
}
