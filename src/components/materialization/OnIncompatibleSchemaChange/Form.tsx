import {
    Autocomplete,
    Button,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import SelectorOption from 'components/editor/Bindings/OnIncompatibleSchemaChange/SelectorOption';
import { AutoCompleteOption } from 'components/editor/Bindings/OnIncompatibleSchemaChange/types';
import AlertBox from 'components/shared/AlertBox';
import useSpecificationIncompatibleSchemaSetting from 'hooks/OnIncompatibleSchemaChange/useSpecificationIncompatibleSchemaSetting';
import useSupportedOptions from 'hooks/OnIncompatibleSchemaChange/useSupportedOptions';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { snackbarSettings } from 'utils/notification-utils';

export default function OnIncompatibleSchemaChangeForm() {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const [inputValue, setInputValue] = useState('');
    const [invalidSetting, setInvalidSetting] = useState(false);

    const formActive = useFormStateStore_isActive();
    const setFormState = useFormStateStore_setFormState();

    const options = useSupportedOptions();
    const { currentSetting, updateOnIncompatibleSchemaChange } =
        useSpecificationIncompatibleSchemaSetting();

    const selection = useMemo(() => {
        if (!currentSetting) {
            return null;
        }

        return options.find((option) => option.val === currentSetting) ?? null;
    }, [currentSetting, options]);

    const updateServer = useCallback(
        async (option?: AutoCompleteOption | null) => {
            setFormState({ status: FormStatus.UPDATING, error: null });

            updateOnIncompatibleSchemaChange(option?.val)
                .then(() => {
                    setFormState({ status: FormStatus.UPDATED });
                })
                .catch(() => {
                    enqueueSnackbar(
                        intl.formatMessage({
                            id: 'incompatibleSchemaChange.update.error',
                        }),
                        { ...snackbarSettings, variant: 'error' }
                    );

                    setFormState({ status: FormStatus.FAILED });
                });
        },
        [enqueueSnackbar, intl, setFormState, updateOnIncompatibleSchemaChange]
    );

    useEffect(() => {
        // No setting at all so we're good
        if (!currentSetting) {
            setInputValue('');
            setInvalidSetting(false);
            return;
        }

        // We have a setting but could not find a matching option
        //  Set a flag to show an error and empty out the input
        if (!selection) {
            setInputValue('');
            setInvalidSetting(true);
            return;
        }

        setInputValue(selection.label);
        setInvalidSetting(false);
    }, [currentSetting, selection]);

    return (
        <Stack spacing={2}>
            {invalidSetting ? (
                <AlertBox
                    severity="error"
                    short
                    sx={{ maxWidth: 'fit-content' }}
                >
                    <Typography>
                        {intl.formatMessage(
                            {
                                id: 'incompatibleSchemaChange.error.message',
                            },
                            {
                                currentSetting,
                            }
                        )}
                    </Typography>
                    <Button
                        disabled={formActive}
                        size="small"
                        sx={{ maxWidth: 'fit-content' }}
                        variant="text"
                        onClick={() => updateServer()}
                    >
                        {intl.formatMessage({
                            id: 'incompatibleSchemaChange.error.cta',
                        })}
                    </Button>
                </AlertBox>
            ) : null}

            {/* The presence of ListboxComponent in autoCompleteDefaultProps prevents
                the options from rendering  */}
            <Autocomplete
                disabled={formActive}
                getOptionLabel={(option) => option.label}
                inputValue={inputValue}
                isOptionEqualToValue={(option, optionValue) => {
                    // We force an undefined some times when we need to clear out the option
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (!optionValue) {
                        return false;
                    }

                    return (
                        option.val ===
                        (typeof optionValue === 'string'
                            ? optionValue
                            : optionValue.val)
                    );
                }}
                onChange={(_state, newVal) => updateServer(newVal)}
                onInputChange={(_event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                options={options}
                renderInput={(params) => {
                    return (
                        <TextField
                            {...params}
                            disabled={formActive}
                            error={invalidSetting}
                            helperText={
                                invalidSetting
                                    ? intl.formatMessage({
                                          id: 'incompatibleSchemaChange.error.message',
                                      })
                                    : undefined
                            }
                            label={intl.formatMessage({
                                id: 'incompatibleSchemaChange.input.label',
                            })}
                            variant="standard"
                        />
                    );
                }}
                renderOption={(renderOptionProps, option) => {
                    return (
                        <li {...renderOptionProps}>
                            <SelectorOption option={option} />
                        </li>
                    );
                }}
                sx={{
                    minWidth: 'fit-content',
                    maxWidth: '50%',
                }}
                value={selection}
            />
        </Stack>
    );
}
