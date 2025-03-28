import { DialogTitle, IconButton } from '@mui/material';

import { Xmark } from 'iconoir-react';
import { useIntl } from 'react-intl';

import type { BaseComponentProps } from 'src/types';

export interface DialogTitleProps extends BaseComponentProps {
    id: string;
    onClose: () => void;
}

function DialogTitleWithClose({
    children,
    onClose,
    ...other
}: DialogTitleProps) {
    const intl = useIntl();

    return (
        <DialogTitle {...other}>
            {children}
            <IconButton
                aria-label={intl.formatMessage({ id: 'cta.close' })}
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
