import {
    Autocomplete,
    AutocompleteChangeReason,
    autocompleteClasses,
    Box,
    Popper,
    Skeleton,
    TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { isEqual } from 'lodash';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import {
    detectAutoCompleteInputReset,
    detectRemoveOptionWithBackspace,
} from 'utils/mui-utils';
import { CollectionData } from './types';
import ListboxComponent from './VirtualizedList';

interface Props {
    options: any[];
    onChange: (collections: string[], reason: AutocompleteChangeReason) => void;
    selectedCollections: string[] | CollectionData[];
    readOnly?: boolean;
    getValue?: (option: any) => string;
    AutocompleteProps?: any; // TODO (typing) - need to typ as props
}

const StyledPopper = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
        'boxSizing': 'border-box',
        '& ul': {
            padding: 0,
            margin: 0,
        },
    },
});

function CollectionSelectorSearch({
    options,
    onChange,
    selectedCollections,
    readOnly = false,
    getValue,
    AutocompleteProps,
}: Props) {
    const intl = useIntl();
    const collectionsLabel = intl.formatMessage({
        id: 'entityCreate.bindingsConfig.collectionsLabel',
    });

    const [missingInput, setMissingInput] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const handlers = {
        updateCollections: (
            event: React.SyntheticEvent,
            value: string[],
            reason: AutocompleteChangeReason
        ) => {
            const removeOptionWithBackspace = detectRemoveOptionWithBackspace(
                event,
                reason
            );

            if (!removeOptionWithBackspace) {
                onChange(value, reason);
            }
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
            <Autocomplete
                {...AutocompleteProps}
                disabled={readOnly}
                disableListWrap
                ListboxComponent={ListboxComponent}
                multiple
                options={options}
                isOptionEqualToValue={(option, value) => {
                    return isEqual(option, value);
                }}
                value={selectedCollections}
                inputValue={inputValue}
                size="small"
                fullWidth
                onChange={handlers.updateCollections}
                onInputChange={(_event, newInputValue, reason) => {
                    const inputBeingReset =
                        detectAutoCompleteInputReset(reason);

                    if (!inputBeingReset) {
                        setInputValue(newInputValue);
                    }
                }}
                blurOnSelect={false}
                disableCloseOnSelect
                disableClearable
                PopperComponent={StyledPopper}
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
                renderGroup={(params) => params as unknown as React.ReactNode}
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
