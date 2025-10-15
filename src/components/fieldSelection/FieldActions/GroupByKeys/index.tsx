import type { BaseButtonProps } from 'src/components/fieldSelection/types';
import type { FieldSelection } from 'src/stores/Binding/slices/FieldSelection';

import { useEffect, useState } from 'react';

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

import ExplicitKey from 'src/components/fieldSelection/FieldActions/GroupByKeys/ExplicitKey';
import GroupByKeysForm from 'src/components/fieldSelection/FieldActions/GroupByKeys/Form';
import ImplicitKey from 'src/components/fieldSelection/FieldActions/GroupByKeys/ImplicitKey';
import SaveButton from 'src/components/fieldSelection/FieldActions/GroupByKeys/SaveButton';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

const TITLE_ID = 'configure-groupBy-keys-title';

const GroupByKeys = ({ bindingUUID, loading, selections }: BaseButtonProps) => {
    const intl = useIntl();

    const groupBy = useBindingStore(
        (state) =>
            state.selections?.[bindingUUID].groupBy ?? {
                explicit: [],
                implicit: [],
            }
    );

    const formActive = useFormStateStore_isActive();

    const [open, setOpen] = useState(false);
    const [localValues, setLocalValues] = useState<FieldSelection[]>([]);

    useEffect(() => {
        if (!selections) {
            return;
        }

        const { explicit } = groupBy;

        const explicitKeys = explicit
            .map((field) =>
                selections.findIndex((selection) => selection.field === field)
            )
            .filter((index) => index > -1)
            .map((index) => selections[index]);

        setLocalValues(explicitKeys);
    }, [groupBy, selections, open]);

    return (
        <>
            <Button
                disabled={formActive || !selections || selections.length === 0}
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
                    <Stack spacing={1} style={{ marginBottom: 24 }}>
                        <Typography style={{ width: 700 }}>
                            {intl.formatMessage({
                                id: 'fieldSelection.groupBy.description',
                            })}
                        </Typography>

                        <ImplicitKey bindingUUID={bindingUUID} />

                        <ExplicitKey bindingUUID={bindingUUID} />
                    </Stack>

                    <GroupByKeysForm
                        localValues={localValues}
                        options={selections ?? []}
                        setLocalValues={setLocalValues}
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
                            close={() => setOpen(false)}
                            loading={loading}
                            selections={localValues}
                        />
                    </Stack>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default GroupByKeys;
