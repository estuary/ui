import type { SxProps } from '@mui/material';
import type { BaseComponentProps } from 'src/types';

export interface SupportWrapperProps extends BaseComponentProps {
    titleMessageId: string;
    stackSx?: SxProps;
}
