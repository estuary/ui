import { TextField } from '@mui/material';
import { useIntl } from 'react-intl';

interface Props {
    itemType: string;
    onChange: (filterValue: string) => void;
    disabled?: boolean;
}

function CollectionSelectorHeaderName({ disabled, itemType, onChange }: Props) {
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
            onChange={(event) => {
                onChange(event.target.value);
            }}
            sx={{
                'flexGrow': 1,
                'my': 1,
                '& .MuiInputBase-root': { borderRadius: 3, my: 0 },
            }}
        />
    );
}

export default CollectionSelectorHeaderName;
