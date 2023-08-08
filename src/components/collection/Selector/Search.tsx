import {
    Autocomplete,
    AutocompleteChangeReason,
    Box,
    Skeleton,
    TextField,
} from '@mui/material';
import BindingsEditorAdd from 'components/editor/Bindings_UnderDev/Add';
import { autoCompleteDefaults_Virtual_Multiple } from 'components/shared/AutoComplete/DefaultProps';
import { isEqual } from 'lodash';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { detectAutoCompleteInputReset } from 'utils/mui-utils';
import { CollectionData } from './types';

interface Props {
    options: any[];
    onChange: (collections: string[], reason: AutocompleteChangeReason) => void;
    selectedCollections: string[] | CollectionData[];
    itemType?: string;
    getValue?: (option: any) => string;
    readOnly?: boolean;
    AutocompleteProps?: any; // TODO (typing) - need to typ as props
}

function CollectionSelectorSearch({
    options,
    onChange,
    selectedCollections,
    readOnly = false,
    itemType,
    getValue,
    AutocompleteProps,
}: Props) {
    const intl = useIntl();
    const collectionsLabel = intl.formatMessage(
        {
            id: 'entityCreate.bindingsConfig.collectionsLabel',
        },
        {
            items: itemType ?? intl.formatMessage({ id: 'terms.collections' }),
        }
    );

    const [missingInput, setMissingInput] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const handlers = {
        updateCollections: (value: string[]) => {
            onChange(value, 'selectOption');
        },
        validateSelection: () => {
            setMissingInput(options.length === 0);
        },
    };

    if (options.length === 0) {
        return <Skeleton />;
    }

    return (
        <Box
            sx={{
                p: '0.5rem 0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <BindingsEditorAdd
                title={collectionsLabel}
                onChange={handlers.updateCollections}
            />

            <Autocomplete
                {...AutocompleteProps}
                {...autoCompleteDefaults_Virtual_Multiple}
                disabled={readOnly}
                disableListWrap
                options={options}
                isOptionEqualToValue={(option, value) => {
                    return isEqual(option, value);
                }}
                value={selectedCollections}
                inputValue={inputValue}
                fullWidth
                onChange={handlers.updateCollections}
                onInputChange={(_event, newInputValue, reason) => {
                    const inputBeingReset =
                        detectAutoCompleteInputReset(reason);

                    if (!inputBeingReset) {
                        setInputValue(newInputValue);
                    }
                }}
                disableClearable
                renderTags={() => null}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={collectionsLabel}
                        required
                        error={missingInput}
                        variant="standard"
                        onBlur={handlers.validateSelection}
                    />
                )}
                renderOption={(props, option, state) => {
                    return [
                        props,
                        getValue ? getValue(option) : option,
                        state.selected,
                    ] as React.ReactNode;
                }}
            />
        </Box>
    );
}

export default CollectionSelectorSearch;
