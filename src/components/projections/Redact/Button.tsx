import type {
    BaseButtonProps,
    BaseProjectionProps,
} from 'src/components/projections/types';

import { useState } from 'react';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import RedactFieldDialog from 'src/components/projections/Redact/Dialog';

const RedactFieldButton = ({
    disabled,
    field,
}: BaseButtonProps & BaseProjectionProps) => {
    const intl = useIntl();

    const [open, setOpen] = useState(false);

    const openDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setOpen(true);
    };

    return (
        <>
            <Button
                disabled={disabled}
                onClick={openDialog}
                size="small"
                variant="outlined"
            >
                {intl.formatMessage({ id: 'cta.redact' })}
            </Button>

            <RedactFieldDialog field={field} open={open} setOpen={setOpen} />
        </>
    );
};

export default RedactFieldButton;
