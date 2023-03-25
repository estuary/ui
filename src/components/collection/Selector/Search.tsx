import {
    Autocomplete,
    AutocompleteChangeReason,
    Box,
    Skeleton,
    TextField,
    Typography,
} from '@mui/material';
import { truncateTextSx } from 'context/Theme';
import { Check } from 'iconoir-react';
import { isEqual } from 'lodash';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import {
    detectAutoCompleteInputReset,
    detectRemoveOptionWithBackspace,
} from 'utils/mui-utils';
import { CollectionData } from './types';

interface Props {
    options: any[];
    onChange: (collections: string[], reason: AutocompleteChangeReason) => void;
    selectedCollections: string[] | CollectionData[];
    readOnly?: boolean;
    getValue?: (option: any) => string;
    AutocompleteProps?: any; // TODO (typing) - need to typ as props
}

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
                renderOption={(props, option, { selected }) => {
                    return (
                        // TODO (styling) weirdly the paddingLeft was getting overwritten
                        //  for dark mode and caused the icon to be too close to the edge
                        //  so hardcoding the padding here for now
                        <li {...props} style={{ paddingLeft: 24 }}>
                            <Box
                                sx={{
                                    ml: -2,
                                    mr: 0.5,
                                }}
                            >
                                <Check
                                    aria-checked={selected}
                                    style={{
                                        visibility: selected
                                            ? 'visible'
                                            : 'hidden',
                                    }}
                                />
                            </Box>
                            <Typography
                                sx={{
                                    ...truncateTextSx,
                                }}
                            >
                                {getValue ? getValue(option) : option}
                            </Typography>
                        </li>
                    );
                }}
            />
        </Box>
    );
}

export default CollectionSelectorSearch;
