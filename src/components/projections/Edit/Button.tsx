import type { BaseEditProjectionProps } from 'src/components/projections/Edit/types';

import { useState } from 'react';

import { Chip, useTheme } from '@mui/material';

import { Plus } from 'iconoir-react';
import { useIntl } from 'react-intl';

import EditProjectionDialog from 'src/components/projections/Edit/Dialog';
import { useEntityType } from 'src/context/EntityContext';

function EditProjectionButton({ field, pointer }: BaseEditProjectionProps) {
    const intl = useIntl();
    const theme = useTheme();

    const entityType = useEntityType();

    const [open, setOpen] = useState(false);

    const openDialog = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();

        setOpen(true);
    };

    if (entityType !== 'capture') {
        return null;
    }

    return (
        <>
            <Chip
                color="primary"
                icon={
                    <Plus
                        style={{
                            color: theme.palette.primary.main,
                            fontSize: 14,
                        }}
                    />
                }
                label={intl.formatMessage({ id: 'cta.add' })}
                onClick={openDialog}
                size="small"
                style={{
                    backgroundColor: 'unset',
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                }}
                variant="outlined"
            />

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
