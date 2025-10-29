import type { BaseProjectionButtonProps } from 'src/components/projections/Edit/types';

import { useState } from 'react';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import RedactFieldDialog from 'src/components/projections/Redact/Dialog';

const RedactFieldButton = ({
    disabled,
    field,
    pointer,
}: BaseProjectionButtonProps) => {
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

            <RedactFieldDialog
                field={field}
                open={open}
                setOpen={setOpen}
                pointer={pointer}
            />
        </>
    );
};

export default RedactFieldButton;
