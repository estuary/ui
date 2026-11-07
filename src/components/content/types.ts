import type { SxProps } from '@mui/material';
import type { Ref } from 'react';
import type { ExternalLinkOptions } from 'src/components/shared/ExternalLink';

export interface SingleLineCodeProps {
    copyButtonRef?: Ref<HTMLButtonElement>;
    value: any;
    compact?: boolean;
    sx?: SxProps;
    subsequentCommandExists?: boolean;
}

export interface MessageWithLinkProps {
    messageID: string;
    link?: string;
    linkOptions?: ExternalLinkOptions;
    intlValues?: any;
}
