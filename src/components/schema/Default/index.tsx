import type { BaseRedactFieldProps } from 'src/components/projections/types';

import { useState } from 'react';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import { DefaultFieldDialog } from 'src/components/schema/Default/Dialog';

export const DefaultFieldButton = ({
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
                {intl.formatMessage({ id: 'cta.default' })}
            </Button>

            <DefaultFieldDialog
                field={field}
                open={open}
                pointer={pointer}
                setOpen={setOpen}
                strategy={strategy}
            />
        </>
    );
};
