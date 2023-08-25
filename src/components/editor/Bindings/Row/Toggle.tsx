import { Button, Switch } from '@mui/material';
import { dataGridEntireCellButtonStyling } from 'context/Theme';
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
        <Button
            aria-label={intl.formatMessage({
                id: disabled ? 'common.disabled' : 'common.enabled',
            })}
            disabled={disableButton}
            sx={dataGridEntireCellButtonStyling}
            variant="text"
            onClick={(event) => {
                event.stopPropagation();
                toggleDisable(collection);
            }}
        >
            <Switch
                disabled={disableButton}
                size="small"
                checked={!disabled}
                color="success"
            />
        </Button>
    );
}

export default BindingsSelectorToggle;
