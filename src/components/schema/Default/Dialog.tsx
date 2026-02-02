import type { PostgrestError } from '@supabase/postgrest-js';
import type { BaseRedactFieldProps } from 'src/components/projections/types';
import type { BaseDialogProps } from 'src/types';

import { useEffect, useMemo, useState } from 'react';

import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@mui/material';

import { useIntl } from 'react-intl';

import { SaveButton } from 'src/components/schema/Default/SaveButton';
import Error from 'src/components/shared/Error';

interface DefaultFieldDialogProps
    extends BaseDialogProps,
        BaseRedactFieldProps {
    fieldTypes: string[];
}

export const DefaultFieldDialog = ({
    field,
    fieldTypes,
    open,
    pointer,
    setOpen,
    strategy,
}: DefaultFieldDialogProps) => {
    const intl = useIntl();

    const [error, setError] = useState<PostgrestError | null>(null);
    const [defaultSetting, setDefaultSetting] = useState<any | null>(null);

    // Determine the input type based on fieldTypes
    const inputType = useMemo(() => {
        const nonNullTypes = fieldTypes.filter((type) => type !== 'null');

        if (nonNullTypes.includes('boolean')) {
            return 'boolean';
        }

        if (nonNullTypes.includes('integer')) {
            return 'integer';
        }

        return 'string';
    }, [fieldTypes]);

    useEffect(() => {
        if (open) {
            // Initialize with the strategy value, converting if needed
            if (inputType === 'boolean' && typeof strategy === 'boolean') {
                setDefaultSetting(
                    strategy === true
                        ? 'true'
                        : strategy === false
                          ? 'false'
                          : undefined
                );
            } else if (
                inputType === 'integer' &&
                typeof strategy === 'number'
            ) {
                setDefaultSetting(strategy);
            } else {
                setDefaultSetting(strategy);
            }
        } else {
            setDefaultSetting(null);
        }
    }, [open, strategy, inputType]);

    return (
        <Dialog maxWidth="sm" open={open} style={{ minWidth: 500 }}>
            <DialogTitle>
                {intl.formatMessage({
                    id: 'schemaEditor.default.dialog.header',
                })}
            </DialogTitle>

            <DialogContent>
                {error ? (
                    <Box style={{ marginBottom: 16, width: 500 }}>
                        <Error condensed error={error} severity="error" />
                    </Box>
                ) : null}

                {inputType === 'boolean' ? (
                    <Autocomplete
                        options={['true', 'false']}
                        value={defaultSetting ?? ''}
                        onChange={(_, newValue) => {
                            setDefaultSetting(newValue === 'true');
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                InputProps={{
                                    ...params.InputProps,
                                    sx: { borderRadius: 3 },
                                }}
                                label={intl.formatMessage({
                                    id: 'schemaEditor.default.label',
                                })}
                                size="small"
                            />
                        )}
                        sx={{ width: 500 }}
                    />
                ) : inputType === 'integer' ? (
                    <TextField
                        type="number"
                        value={defaultSetting ?? ''}
                        InputProps={{
                            sx: { borderRadius: 3 },
                        }}
                        label={intl.formatMessage({
                            id: 'schemaEditor.default.label',
                        })}
                        onChange={(event) => {
                            const value = event.target.value;
                            setDefaultSetting(
                                value === '' ? undefined : parseInt(value, 10)
                            );
                        }}
                        size="small"
                        sx={{ width: 500 }}
                    />
                ) : (
                    <TextField
                        value={defaultSetting ?? ''}
                        InputProps={{
                            sx: { borderRadius: 3 },
                        }}
                        label={intl.formatMessage({
                            id: 'schemaEditor.default.label',
                        })}
                        onChange={(event) => {
                            const value = event.target.value;
                            setDefaultSetting(value === '' ? undefined : value);
                        }}
                        size="small"
                        sx={{ width: 500 }}
                    />
                )}
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={() => {
                        setError(null);
                        setOpen(false);
                    }}
                    variant="text"
                >
                    {intl.formatMessage({ id: 'cta.cancel' })}
                </Button>

                <SaveButton
                    closeDialog={() => {
                        setError(null);
                        setOpen(false);
                    }}
                    field={field}
                    pointer={pointer}
                    previousStrategy={strategy}
                    setError={setError}
                    strategy={
                        inputType === 'boolean' && defaultSetting !== null
                            ? defaultSetting === 'true'
                            : defaultSetting
                    }
                />
            </DialogActions>
        </Dialog>
    );
};
