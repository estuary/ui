import type { EditProjectionButtonProps } from 'src/components/projections/Edit/types';

import { useState } from 'react';

import { Button } from '@mui/material';

import { useIntl } from 'react-intl';

import EditProjectionDialog from 'src/components/projections/Edit/Dialog';

function EditProjectionButton({
    disabled,
    field,
    pointer,
}: EditProjectionButtonProps) {
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
                {intl.formatMessage({ id: 'cta.rename' })}
            </Button>

            <EditProjectionDialog
                field={field}
                open={open}
                setOpen={setOpen}
                pointer={pointer}
            />
        </>
    );
}

export default EditProjectionButton;
