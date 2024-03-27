import { TextField } from '@mui/material';
import ClearInput from 'components/shared/Input/Clear';
import { useIntl } from 'react-intl';

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
            defaultValue={inputValue}
            InputProps={{
                endAdornment: (
                    <ClearInput
                        show={Boolean(!disabled && inputValue)}
                        onClear={onChange}
                    />
                ),
            }}
            onChange={(event) => {
                onChange(event.target.value);
            }}
            sx={{
                'width': '100%',
                'my': 1,
                '& .MuiInputBase-root': { borderRadius: 3, my: 0 },
            }}
        />
    );
}

export default CollectionSelectorHeaderName;
