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

import GroupByKeysForm from 'src/components/fieldSelection/FieldActions/GroupByKeys/Form';
import SaveButton from 'src/components/fieldSelection/FieldActions/GroupByKeys/SaveButton';
import ChipList from 'src/components/shared/ChipList';
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
        const { explicit } = groupBy;

        if (!selections) {
            return;
        }

        const explicitKeys = explicit
            .map((field) =>
                selections.findIndex((selection) => selection.field === field)
            )
            .filter((index) => index > -1)
            .map((index) => selections[index]);

        setLocalValues(explicitKeys.length > 0 ? explicitKeys : []);
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
                    <Box style={{ marginBottom: 24 }}>
                        <Stack
                            direction="row"
                            spacing={1}
                            style={{ alignItems: 'center' }}
                        >
                            <Typography>
                                {intl.formatMessage({
                                    id: 'fieldSelection.groupBy.label.implicitKeys',
                                })}
                            </Typography>

                            <ChipList
                                maxChips={3}
                                stripPath={false}
                                values={groupBy.implicit}
                            />
                        </Stack>
                    </Box>

                    <GroupByKeysForm
                        localValues={localValues}
                        options={
                            selections?.filter(
                                ({ projection }) =>
                                    !projection?.inference.types.includes(
                                        'object'
                                    ) &&
                                    !projection?.inference.types.includes(
                                        'array'
                                    )
                            ) ?? []
                        }
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
