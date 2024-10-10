import { Autocomplete, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { snackbarSettings } from 'utils/notification-utils';
import {
    useBinding_currentBindingUUID,
    useBinding_currentCollection,
} from 'stores/Binding/hooks';
import { useEditorStore_queryResponse_draftSpecs_schemaProp } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import { autoCompleteDefaultProps } from './shared';
import useUpdateOnIncompatibleSchemaChange, {
    BindingMetadata,
} from './useUpdateOnIncompatibleSchemaChange';
import useSupportedOptions from './useSupportedOptions';
import { AutoCompleteOption } from './types';
import SelectorOption from './SelectorOption';

interface Props {
    bindingIndex: number;
}

function OnIncompatibleSchemaChangeForm({ bindingIndex = -1 }: Props) {
    const intl = useIntl();

    const [inputValue, setInputValue] = useState('');
    const [invalidSetting, setInvalidSetting] = useState(false);

    const { enqueueSnackbar } = useSnackbar();
    const { updateOnIncompatibleSchemaChange } =
        useUpdateOnIncompatibleSchemaChange();

    const currentSetting = useEditorStore_queryResponse_draftSpecs_schemaProp(
        bindingIndex,
        'onIncompatibleSchemaChange'
    );

    const currentCollection = useBinding_currentCollection();
    const currentBindingUUID = useBinding_currentBindingUUID();

    const formActive = useFormStateStore_isActive();

    const options = useSupportedOptions();

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
            updateOnIncompatibleSchemaChange(value?.val, bindingMetadata)
                .then(() => {})
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
                });
        },
        [
            bindingMetadata,
            enqueueSnackbar,
            intl,
            updateOnIncompatibleSchemaChange,
        ]
    );

    useEffect(() => {
        if (!currentSetting) {
            setInputValue('');
            return;
        }

        if (!currentValue) {
            setInputValue('');
            setInvalidSetting(true);
            return;
        }

        // We have a setting so we should try to use the associate value.
        //  However, if we were unable to find one then is probably an
        //  invalid option (they typoed in the editor) and so we clear things
        setInputValue(currentValue.label);
        setInvalidSetting(false);
    }, [currentSetting, currentValue]);

    return (
        <>
            {invalidSetting ? (
                <AlertBox severity="error" short>
                    {intl.formatMessage({
                        id: 'incompatibleSchemaChange.input.error',
                    })}
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
                            helperText={intl.formatMessage({
                                id: 'resetDataFlow.materializations.selector.helper',
                            })}
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
        </>
    );
}

export default OnIncompatibleSchemaChangeForm;
