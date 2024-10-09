import { Autocomplete, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { snackbarSettings } from 'utils/notification-utils';
import SelectorOption from './SelectorOption';
import { autoCompleteDefaultProps } from './shared';
import useIncompatibleSchemaChange from './useIncompatibleSchemaChange';
import useSupportedOptions from './useSupportedOptions';

interface Props {
    bindingUUID: string;
    collectionName: string;
}

function IncompatibleSchemaForm({ bindingUUID, collectionName }: Props) {
    const intl = useIntl();

    const [inputValue, setInputValue] = useState('');

    const { enqueueSnackbar } = useSnackbar();
    const updateIncompatibleSchemaChange = useIncompatibleSchemaChange(
        bindingUUID,
        collectionName
    );

    const formActive = useFormStateStore_isActive();

    const options = useSupportedOptions();

    const skipServer = useRef(false);
    useEffect(() => {
        skipServer.current = true;
        // setLocalCopy(fullSource ?? {});
        // When the binding UUID changes we want to basically do a mini-reset of the form state
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bindingUUID]);

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
                updateIncompatibleSchemaChange(value?.val, skipServer.current)
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
                    })
                    .finally(() => {
                        if (skipServer.current) {
                            skipServer.current = false;
                        }
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

export default IncompatibleSchemaForm;
