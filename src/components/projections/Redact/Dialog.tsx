import type { AutocompleteRenderInputParams } from '@mui/material';
import type { PostgrestError } from '@supabase/postgrest-js';
import type {
    BaseDialogProps,
    BaseRedactFieldProps,
} from 'src/components/projections/types';
import type { RedactionStrategy_Schema } from 'src/types/schemaModels';

import { useEffect, useState } from 'react';

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
    useTheme,
} from '@mui/material';

import { Check } from 'iconoir-react';
import { useIntl } from 'react-intl';

import SaveButton from 'src/components/projections/Redact/SaveButton';
import Error from 'src/components/shared/Error';
import { diminishedTextColor } from 'src/context/Theme';
import { translateRedactionStrategy } from 'src/utils/schema-utils';

const options: RedactionStrategy_Schema[] = ['block', 'sha256'];

const RedactFieldDialog = ({
    field,
    open,
    pointer,
    setOpen,
    strategy,
}: BaseDialogProps & BaseRedactFieldProps) => {
    const intl = useIntl();
    const theme = useTheme();

    const [error, setError] = useState<PostgrestError | null>(null);
    const [redactionStrategy, setRedactionStrategy] =
        useState<RedactionStrategy_Schema | null>(null);

    useEffect(() => {
        setRedactionStrategy(
            open ? translateRedactionStrategy(strategy) : null
        );
    }, [open, strategy]);

    return (
        <Dialog maxWidth="sm" open={open} style={{ minWidth: 500 }}>
            <DialogTitle>
                {intl.formatMessage({
                    id: 'projection.dialog.rename.header',
                })}
            </DialogTitle>

            <DialogContent>
                {error ? (
                    <Box style={{ marginBottom: 16, width: 500 }}>
                        <Error condensed error={error} severity="error" />
                    </Box>
                ) : null}

                <Autocomplete
                    onChange={(_event, value) => {
                        if (error) {
                            setError(null);
                        }

                        setRedactionStrategy(value);
                    }}
                    options={options}
                    renderInput={({
                        InputProps,
                        ...params
                    }: AutocompleteRenderInputParams) => (
                        <TextField
                            {...params}
                            InputProps={{
                                ...InputProps,
                                sx: { borderRadius: 3 },
                            }}
                            label={intl.formatMessage({
                                id: 'projection.label.redactionStrategy',
                            })}
                            size="small"
                            sx={{ width: 500 }}
                        />
                    )}
                    renderOption={(renderOptionProps, option, state) => {
                        const { key, ...optionProps } = renderOptionProps;

                        return (
                            <Box
                                {...optionProps}
                                component="li"
                                key={key}
                                style={{
                                    alignItems: 'flex-start',
                                    display: 'flex',
                                    paddingLeft: 10,
                                    paddingRight: 8,
                                }}
                            >
                                {state.selected ? (
                                    <Check
                                        style={{
                                            color: theme.palette.primary.main,
                                            fontSize: 12,
                                            marginRight: 4,
                                            marginTop: 2,
                                        }}
                                    />
                                ) : (
                                    <Box
                                        style={{ width: 18, marginRight: 4 }}
                                    />
                                )}

                                <Stack>
                                    <Typography
                                        style={{
                                            fontWeight: 500,
                                            marginBottom: 4,
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {intl.formatMessage({
                                            id: `projection.option.${option}.label`,
                                        })}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            color: diminishedTextColor[
                                                theme.palette.mode
                                            ],
                                        }}
                                    >
                                        {intl.formatMessage({
                                            id: `projection.option.${option}.description`,
                                        })}
                                    </Typography>
                                </Stack>
                            </Box>
                        );
                    }}
                    value={redactionStrategy}
                />
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
                    setError={setError}
                    strategy={redactionStrategy}
                />
            </DialogActions>
        </Dialog>
    );
};

export default RedactFieldDialog;
