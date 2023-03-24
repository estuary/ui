import {
    Autocomplete,
    AutocompleteChangeReason,
    Box,
    TextField,
    Typography,
} from '@mui/material';
import { truncateTextSx } from 'context/Theme';
import { Check } from 'iconoir-react';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import {
    detectAutoCompleteInputReset,
    detectRemoveOptionWithBackspace,
} from 'utils/mui-utils';

interface Props {
    options: any[];
    onChange: (collections: string[], reason: AutocompleteChangeReason) => void;
    selectedCollections: string[];
    readOnly?: boolean;
}

function CollectionSelectorSearch({
    options,
    onChange,
    selectedCollections,
    readOnly = false,
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

    return options.length > 0 ? (
        <Box
            sx={{
                p: '0.5rem 0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <Autocomplete
                disabled={readOnly}
                multiple
                options={options}
                isOptionEqualToValue={(option, value) => {
                    return option === value;
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
                                {option}
                            </Typography>
                        </li>
                    );
                }}
            />
        </Box>
    ) : null;
}

export default CollectionSelectorSearch;
