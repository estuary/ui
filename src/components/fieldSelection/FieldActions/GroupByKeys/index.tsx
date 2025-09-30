import type { BaseProps } from 'src/components/fieldSelection/types';

import { useState } from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';

import { useIntl } from 'react-intl';

import GroupByKeysForm from 'src/components/fieldSelection/FieldActions/GroupByKeys/Form';
import SaveButton from 'src/components/fieldSelection/FieldActions/GroupByKeys/SaveButton';

const TITLE_ID = 'configure-groupBy-keys-title';

const GroupByKeys = ({ bindingUUID, loading, selections }: BaseProps) => {
    const intl = useIntl();

    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => {
                    setOpen(true);
                }}
                style={{ minWidth: 'fit-content' }}
                variant="outlined"
            >
                {intl.formatMessage({ id: 'fieldSelection.cta.groupBy' })}
            </Button>

            <Dialog open={open} maxWidth="md" aria-labelledby={TITLE_ID}>
                <DialogTitle>
                    {intl.formatMessage({
                        id: 'fieldSelection.groupBy.header',
                    })}
                </DialogTitle>

                <DialogContent>
                    <Typography style={{ marginBottom: 24 }}>
                        {intl.formatMessage({
                            id: 'fieldSelection.groupBy.description',
                        })}
                    </Typography>

                    <GroupByKeysForm
                        bindingUUID={bindingUUID}
                        loading={loading}
                        selections={selections}
                    />
                </DialogContent>

                <DialogActions>
                    <Stack direction="row" spacing={1}>
                        <Button
                            component={Box}
                            disabled={loading}
                            onClick={() => {
                                setOpen(false);
                            }}
                            variant="text"
                        >
                            {intl.formatMessage({ id: 'cta.cancel' })}
                        </Button>

                        <SaveButton
                            bindingUUID={bindingUUID}
                            loading={loading}
                            selections={selections}
                        />
                    </Stack>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default GroupByKeys;
