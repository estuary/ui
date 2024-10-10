import { Autocomplete, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ReactNode, useState } from 'react';
import { useIntl } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { snackbarSettings } from 'utils/notification-utils';
import {
    useBinding_currentBindingUUID,
    useBinding_currentCollection,
} from 'stores/Binding/hooks';
import SelectorOption from './SelectorOption';
import { autoCompleteDefaultProps } from './shared';
import useUpdateOnIncompatibleSchemaChange, {
    BindingMetadata,
} from './useUpdateOnIncompatibleSchemaChange';
import useSupportedOptions from './useSupportedOptions';

interface Props {
    bindingIndex: number;
}

function OnIncompatibleSchemaChangeForm({ bindingIndex = -1 }: Props) {
    const intl = useIntl();

    const [inputValue, setInputValue] = useState('');

    const { enqueueSnackbar } = useSnackbar();
    const { updateOnIncompatibleSchemaChange } =
        useUpdateOnIncompatibleSchemaChange();

    const currentCollection = useBinding_currentCollection();
    const currentBindingUUID = useBinding_currentBindingUUID();

    const formActive = useFormStateStore_isActive();

    const options = useSupportedOptions();

    return (
        <Autocomplete
            {...autoCompleteDefaultProps}
            multiple={false}
            disabled={formActive}
            getOptionLabel={(option) => option.label}
            inputValue={inputValue}
            options={options}
            value={null}
            sx={{
                minWidth: 'fit-content',
                maxWidth: '50%',
            }}
            isOptionEqualToValue={(option, optionValue) =>
                option.val === optionValue.val
            }
            onChange={async (_state, value) => {
                const singleBindingUpdate =
                    bindingIndex > -1 &&
                    currentCollection &&
                    currentBindingUUID;

                const bindingMetadata: BindingMetadata[] = singleBindingUpdate
                    ? [{ collection: currentCollection, bindingIndex }]
                    : [];

                updateOnIncompatibleSchemaChange(value?.val, bindingMetadata)
                    .then(() => {})
                    .catch((err) => {
                        enqueueSnackbar(
                            intl.formatMessage({
                                id:
                                    err === 'no binding'
                                        ? 'notBeforeNotAfter.update.error.noBinding'
                                        : 'notBeforeNotAfter.update.error',
                            }),
                            { ...snackbarSettings, variant: 'error' }
                        );
                    });
            }}
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
                            id: 'resetDataFlow.materializations.selector.label',
                        })}
                        variant="standard"
                    />
                );
            }}
            renderOption={(renderOptionProps, option, state) => {
                const RowContent = <SelectorOption option={option} />;

                return [
                    renderOptionProps,
                    RowContent,
                    state.selected,
                ] as ReactNode;
            }}
        />
    );
}

export default OnIncompatibleSchemaChangeForm;
