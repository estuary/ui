import type { AutocompleteRenderInputParams } from '@mui/material';
import type { BaseProjectionDialogProps } from 'src/components/projections/Edit/types';
import type { RedactionStrategy } from 'src/types/schemaModels';

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

import { diminishedTextColor } from 'src/context/Theme';
import { useBinding_currentCollection } from 'src/stores/Binding/hooks';

const options: RedactionStrategy[] = ['block', 'sha256'];

const RedactFieldDialog = ({
    field,
    open,
    pointer,
    setOpen,
}: BaseProjectionDialogProps) => {
    const intl = useIntl();
    const theme = useTheme();

    const currentCollection = useBinding_currentCollection();

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
                                        {option}
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

                <Button
                    onClick={() => {
                        setOpen(false);
                    }}
                    variant="outlined"
                >
                    {intl.formatMessage({
                        id: 'cta.evolve',
                    })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RedactFieldDialog;
