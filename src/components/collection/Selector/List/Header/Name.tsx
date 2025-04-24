import { useCallback } from 'react';

import { TextField } from '@mui/material';

import { useIntl } from 'react-intl';

import ClearInput from 'src/components/shared/Input/Clear';

interface Props {
    inputValue: string;
    itemType: string;
    onChange: (filterValue: string) => void;
    disabled?: boolean;
}

function CollectionSelectorHeaderName({
    disabled,
    inputValue,
    itemType,
    onChange,
}: Props) {
    const intl = useIntl();

    // Store off the update function to make sure both the onChange and onClear
    //  update both the local and parent value
    const updateParent = useCallback(
        (newValue: any) => {
            onChange(newValue);
        },
        [onChange]
    );

    return (
        <TextField
            disabled={disabled}
            label={intl.formatMessage(
                {
                    id: 'entityCreate.bindingsConfig.list.search',
                },
                {
                    itemType,
                }
            )}
            size="small"
            variant="outlined"
            value={inputValue}
            InputProps={{
                endAdornment: (
                    <ClearInput
                        show={Boolean(!disabled && inputValue)}
                        onClear={updateParent}
                    />
                ),
            }}
            onChange={(event) => updateParent(event.target.value)}
            sx={{
                'width': '100%',
                'my': 1,
                '& .MuiInputBase-root': { borderRadius: 3, my: 0 },
            }}
        />
    );
}

export default CollectionSelectorHeaderName;
