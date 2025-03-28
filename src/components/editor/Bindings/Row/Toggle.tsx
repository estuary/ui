import { Button, Switch } from '@mui/material';
import { dataGridEntireCellButtonStyling } from 'src/context/Theme';
import { useIntl } from 'react-intl';
import {
    useBinding_resourceConfigOfMetaBindingProperty,
    useBinding_toggleDisable,
} from 'src/stores/Binding/hooks';

interface Props {
    bindingUUID: string;
    disableButton: boolean;
}

function BindingsSelectorToggle({ bindingUUID, disableButton }: Props) {
    const intl = useIntl();

    const toggleDisable = useBinding_toggleDisable();
    const disabled = useBinding_resourceConfigOfMetaBindingProperty(
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
            onClick={() => {
                toggleDisable(bindingUUID);
            }}
        >
            <Switch
                disabled={disableButton}
                size="small"
                checked={!disabled}
                color="success"
                id={`binding-toggle__${bindingUUID}`}
            />
        </Button>
    );
}

export default BindingsSelectorToggle;
