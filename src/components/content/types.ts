import type { SxProps, Theme } from '@mui/material';

export interface SingleLineCodeProps {
    value: any;
    compact?: boolean;
    sx?: SxProps;
    subsequentCommandExists?: boolean;
}

export interface MessageWithLinkProps {
    messageID: string;
    link?: string;
    linkOptions?: { sx?: SxProps<Theme> };
    intlValues?: any;
}
