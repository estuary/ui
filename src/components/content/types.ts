import type { SxProps } from '@mui/material';
import type { ExternalLinkOptions } from 'src/components/shared/ExternalLink';

export interface SingleLineCodeProps {
    value: any;
    sx?: SxProps;
    subsequentCommandExists?: boolean;
}

export interface MessageWithLinkProps {
    messageID: string;
    link?: string;
    linkOptions?: ExternalLinkOptions;
    intlValues?: any;
}
