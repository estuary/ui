import { DialogTitle, IconButton } from '@mui/material';
import { Cancel } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { BaseComponentProps } from 'types';

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
                <Cancel />
            </IconButton>
        </DialogTitle>
    );
}

export default DialogTitleWithClose;
