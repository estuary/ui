import { FormControlLabel, Switch } from '@mui/material';
import { useIntl } from 'react-intl';
import {
    useResourceConfig_resourceConfigOfCollectionProperty,
    useResourceConfig_toggleDisable,
} from 'stores/ResourceConfig/hooks';

interface Props {
    collection: string;
    disableButton: boolean;
}

function BindingsSelectorToggle({ collection, disableButton }: Props) {
    const intl = useIntl();
    const toggleDisable = useResourceConfig_toggleDisable();
    const disabled = useResourceConfig_resourceConfigOfCollectionProperty(
        collection,
        'disable'
    );

    return (
        <FormControlLabel
            control={
                <Switch
                    disabled={disableButton}
                    size="small"
                    checked={!disabled}
                    color="success"
                    onChange={(event) => {
                        event.stopPropagation();
                        toggleDisable(collection);
                    }}
                />
            }
            label={intl.formatMessage({
                id: disabled ? 'common.disabled' : 'common.enabled',
            })}
            labelPlacement="bottom"
            sx={{
                '& .MuiFormControlLabel-label': {
                    height: 0,
                    visibility: 'collapse',
                },
            }}
        />
    );
}

export default BindingsSelectorToggle;
