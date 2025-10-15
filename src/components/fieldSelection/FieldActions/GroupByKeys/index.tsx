import type { BaseButtonProps } from 'src/components/fieldSelection/types';
import type { FieldSelection } from 'src/stores/Binding/slices/FieldSelection';

import { useEffect, useMemo, useState } from 'react';

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

import ExistingKey from 'src/components/fieldSelection/FieldActions/GroupByKeys/ExistingKey';
import GroupByKeysForm from 'src/components/fieldSelection/FieldActions/GroupByKeys/Form';
import SaveButton from 'src/components/fieldSelection/FieldActions/GroupByKeys/SaveButton';
import useLiveGroupByKey from 'src/hooks/fieldSelection/useLiveGroupByKey';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

const TITLE_ID = 'configure-groupBy-keys-title';

const GroupByKeys = ({ bindingUUID, loading, selections }: BaseButtonProps) => {
    const intl = useIntl();

    const { existingGroupByKey } = useLiveGroupByKey(bindingUUID);

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

    const displayExplicitKeys = useMemo(
        () =>
            Boolean(
                existingGroupByKey.length > 0 &&
                    (existingGroupByKey.length !== groupBy.implicit.length ||
                        groupBy.implicit.some((field, index) =>
                            existingGroupByKey.length > index
                                ? existingGroupByKey[index] !== field
                                : false
                        ))
            ),
        [existingGroupByKey, groupBy.implicit]
    );

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

                        <ExistingKey
                            labelId="fieldSelection.groupBy.label.implicitKeys"
                            values={groupBy.implicit}
                        />

                        {displayExplicitKeys ? (
                            <ExistingKey
                                labelId="fieldSelection.groupBy.label.explicitKeys"
                                values={existingGroupByKey}
                            />
                        ) : null}
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
