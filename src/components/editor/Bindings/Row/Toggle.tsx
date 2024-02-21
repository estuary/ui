import { Button, Switch } from '@mui/material';
import { dataGridEntireCellButtonStyling } from 'context/Theme';
import { useIntl } from 'react-intl';
import { useBinding_resourceConfigOfMetaCollectionProperty } from 'stores/Binding/hooks';
import { useResourceConfig_toggleDisable } from 'stores/ResourceConfig/hooks';

interface Props {
    bindingUUID: string;
    collection: string;
    disableButton: boolean;
}

function BindingsSelectorToggle({
    bindingUUID,
    collection,
    disableButton,
}: Props) {
    const intl = useIntl();
    const toggleDisable = useResourceConfig_toggleDisable();
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
