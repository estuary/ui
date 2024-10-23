import {
    Autocomplete,
    Button,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import {
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
} from 'stores/FormState/hooks';
import { snackbarSettings } from 'utils/notification-utils';
import {
    useBinding_currentBindingUUID,
    useBinding_currentCollection,
} from 'stores/Binding/hooks';
import { useEditorStore_queryResponse_draftSpecs_schemaProp } from 'components/editor/Store/hooks';
import { FormStatus } from 'stores/FormState/types';
import AlertBox from 'components/shared/AlertBox';
import useSupportedOptions from 'hooks/OnIncompatibleSchemaChange/useSupportedOptions';
import useUpdateOnIncompatibleSchemaChange from 'hooks/OnIncompatibleSchemaChange/useUpdateOnIncompatibleSchemaChange';
import { BindingMetadata } from 'types';
import { autoCompleteDefaultProps } from './shared';
import { AutoCompleteOption } from './types';
import SelectorOption from './SelectorOption';

interface Props {
    bindingIndex: number;
}

function OnIncompatibleSchemaChangeForm({ bindingIndex = -1 }: Props) {
    const intl = useIntl();
    const { enqueueSnackbar } = useSnackbar();

    const [inputValue, setInputValue] = useState('');
    const [invalidSetting, setInvalidSetting] = useState(false);

    const currentCollection = useBinding_currentCollection();
    const currentBindingUUID = useBinding_currentBindingUUID();

    const formActive = useFormStateStore_isActive();
    const setFormState = useFormStateStore_setFormState();

    const currentSetting = useEditorStore_queryResponse_draftSpecs_schemaProp(
        bindingIndex,
        'onIncompatibleSchemaChange'
    );

    const options = useSupportedOptions();
    const { updateOnIncompatibleSchemaChange } =
        useUpdateOnIncompatibleSchemaChange();

    const currentValue = useMemo(() => {
        if (!currentSetting) {
            return null;
        }
        return options.find((option) => option.val === currentSetting) ?? null;
    }, [currentSetting, options]);

    const bindingMetadata = useMemo<BindingMetadata[]>(() => {
        if (bindingIndex > -1 && currentCollection && currentBindingUUID) {
            return [{ collection: currentCollection, bindingIndex }];
        }

        return [];
    }, [bindingIndex, currentBindingUUID, currentCollection]);

    const updateServer = useCallback(
        async (value?: AutoCompleteOption | null) => {
            setFormState({ status: FormStatus.UPDATING, error: null });

            updateOnIncompatibleSchemaChange(value?.val, bindingMetadata)
                .then(() => {
                    setFormState({ status: FormStatus.UPDATED });
                })
                .catch((err) => {
                    enqueueSnackbar(
                        intl.formatMessage({
                            id:
                                err === 'no binding'
                                    ? 'updateBinding.error.noBinding'
                                    : 'incompatibleSchemaChange.update.error',
                        }),
                        { ...snackbarSettings, variant: 'error' }
                    );

                    setFormState({ status: FormStatus.FAILED });
                });
        },
        [
            bindingMetadata,
            enqueueSnackbar,
            intl,
            setFormState,
            updateOnIncompatibleSchemaChange,
        ]
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
        if (!currentValue) {
            setInputValue('');
            setInvalidSetting(true);
            return;
        }

        setInputValue(currentValue.label);
        setInvalidSetting(false);
    }, [currentSetting, currentValue]);

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
            <Autocomplete
                {...autoCompleteDefaultProps}
                disabled={formActive}
                inputValue={inputValue}
                multiple={false}
                options={options}
                value={currentValue}
                sx={{
                    minWidth: 'fit-content',
                    maxWidth: '50%',
                }}
                getOptionLabel={(option) => option.label}
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
            />
        </Stack>
    );
}

export default OnIncompatibleSchemaChangeForm;
