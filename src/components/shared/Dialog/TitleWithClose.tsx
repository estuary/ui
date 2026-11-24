import type { SxProps, Theme } from '@mui/material';
import type { BaseComponentProps } from 'src/types';

import { DialogTitle, IconButton } from '@mui/material';

import { Xmark } from 'iconoir-react';
import { useLeaf } from 'react-semantic-tree';

interface DialogTitleProps extends BaseComponentProps {
    id: string;
    onClose: () => void;
    disabled?: boolean;
    sx?: SxProps<Theme>;
}

function DialogTitleWithClose({
    children,
    onClose,
    disabled,
    ...other
}: DialogTitleProps) {
    const { ref: closeRef } = useLeaf('Close');

    return (
        <DialogTitle {...other}>
            {children}
            <IconButton
                ref={closeRef}
                aria-label="Close"
                disabled={disabled}
                onClick={onClose}
                sx={{
                    color: (theme) => theme.palette.text.primary,
                    position: 'absolute',
                    right: 8,
                    top: 8,
                }}
            >
                <Xmark />
            </IconButton>
        </DialogTitle>
    );
}

export default DialogTitleWithClose;
