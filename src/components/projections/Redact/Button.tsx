import type { BaseRedactFieldProps } from 'src/components/projections/types';

import { useState } from 'react';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import RedactFieldDialog from 'src/components/projections/Redact/Dialog';

const RedactFieldButton = ({
    disabled,
    field,
    pointer,
    strategy,
}: BaseRedactFieldProps) => {
    const intl = useIntl();

    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                disabled={disabled}
                onClick={(event: React.MouseEvent<HTMLElement>) => {
                    event.preventDefault();

                    setOpen(true);
                }}
                size="small"
                variant="outlined"
            >
                {intl.formatMessage({ id: 'cta.redact' })}
            </Button>

            <RedactFieldDialog
                field={field}
                open={open}
                pointer={pointer}
                setOpen={setOpen}
                strategy={strategy}
            />
        </>
    );
};

export default RedactFieldButton;
