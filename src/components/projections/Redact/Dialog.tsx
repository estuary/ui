import type { AutocompleteRenderInputParams } from '@mui/material';
import type {
    BaseDialogProps,
    BaseProjectionProps,
} from 'src/components/projections/types';
import type { RedactionStrategy } from 'src/types/schemaModels';

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
    useTheme,
} from '@mui/material';

import { Check } from 'iconoir-react';
import { useIntl } from 'react-intl';

import { useBindingsEditorStore } from 'src/components/editor/Bindings/Store/create';
import SaveButton from 'src/components/projections/Redact/SaveButton';
import { diminishedTextColor } from 'src/context/Theme';
import { useBinding_currentCollection } from 'src/stores/Binding/hooks';

const options: RedactionStrategy[] = ['block', 'sha256'];

const RedactFieldDialog = ({
    field,
    open,
    setOpen,
}: BaseDialogProps & BaseProjectionProps) => {
    const intl = useIntl();
    const theme = useTheme();

    const currentCollection = useBinding_currentCollection();

    // TODO: spec -> schema -> properties
    const existingRedactionStrategy = useBindingsEditorStore(
        (state) =>
            state.collectionData?.spec?.properties?.[field]?.redact?.strategy ??
            null
    );

    const [redactionStrategy, setRedactionStrategy] =
        useState<RedactionStrategy | null>(existingRedactionStrategy);

    return (
        <Dialog maxWidth="sm" open={open} style={{ minWidth: 500 }}>
            <DialogTitle>
                {intl.formatMessage({
                    id: 'projection.dialog.rename.header',
                })}
            </DialogTitle>

            <DialogContent>
                {/* {serverError ? (
                    <Box style={{ marginBottom: 16 }}>
                        <Error condensed error={serverError} severity="error" />
                    </Box>
                ) : null} */}

                <Typography sx={{ mb: 3 }}>
                    {intl.formatMessage(
                        {
                            id: 'projection.dialog.redact.message',
                        },
                        {
                            collection: (
                                <span style={{ fontWeight: 500 }}>
                                    {currentCollection}
                                </span>
                            ),
                        }
                    )}
                </Typography>

                <Autocomplete
                    onChange={(_event, value) => {
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
                        setOpen(false);
                    }}
                    variant="text"
                >
                    {intl.formatMessage({ id: 'cta.cancel' })}
                </Button>

                <SaveButton
                    field={field}
                    setOpen={setOpen}
                    strategy={redactionStrategy}
                />
            </DialogActions>
        </Dialog>
    );
};

export default RedactFieldDialog;
