import { Button, Switch } from '@mui/material';
import { dataGridEntireCellButtonStyling } from 'context/Theme';
import { useIntl } from 'react-intl';
import {
    useBinding_resourceConfigOfMetaCollectionProperty,
    useBinding_toggleDisable,
} from 'stores/Binding/hooks';

interface Props {
    bindingUUID: string;
    disableButton: boolean;
}

function BindingsSelectorToggle({ bindingUUID, disableButton }: Props) {
    const intl = useIntl();

    const toggleDisable = useBinding_toggleDisable();
    const disabled = useBinding_resourceConfigOfMetaCollectionProperty(
        bindingUUID,
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
                toggleDisable(bindingUUID);
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
