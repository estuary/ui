import type { BaseProps } from 'src/components/fieldSelection/types';

import { useState } from 'react';

import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { arrayMove } from '@dnd-kit/sortable';
import { useIntl } from 'react-intl';

import SaveButton from 'src/components/fieldSelection/FieldActions/GroupByKeys/SaveButton';
import SortableTags from 'src/components/schema/KeyAutoComplete/SortableTags';

const TITLE_ID = 'configure-groupBy-keys-title';

const GroupByKeys = ({ bindingUUID, loading, selections }: BaseProps) => {
    const intl = useIntl();

    const [open, setOpen] = useState(false);

    const [localCopyValue, setLocalCopyValue] = useState<string[]>([]);

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

            <Dialog
                open={open}
                maxWidth="md"
                fullWidth
                aria-labelledby={TITLE_ID}
            >
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

                    <Autocomplete
                        multiple
                        options={selections?.map(({ field }) => field) ?? []}
                        renderInput={(params) => {
                            return <TextField {...params} variant="standard" />;
                        }}
                        renderTags={(tagValues, getTagProps, ownerState) => {
                            return (
                                <SortableTags
                                    getTagProps={getTagProps}
                                    onOrderChange={async (activeId, overId) => {
                                        const oldIndex =
                                            localCopyValue.indexOf(activeId);
                                        const newIndex =
                                            localCopyValue.indexOf(overId);

                                        const updatedArray = arrayMove<string>(
                                            localCopyValue,
                                            oldIndex,
                                            newIndex
                                        );

                                        setLocalCopyValue(updatedArray);
                                        // await changeHandler?.(
                                        //     null,
                                        //     updatedArray,
                                        //     'orderingUpdated'
                                        // );
                                    }}
                                    ownerState={ownerState}
                                    values={tagValues}
                                />
                            );
                        }}
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
