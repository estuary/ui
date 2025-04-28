import type { BindingsSelectorToggleProps } from 'src/components/editor/Bindings/Row/types';

import { Button, Switch } from '@mui/material';

import { useIntl } from 'react-intl';

import { dataGridEntireCellButtonStyling } from 'src/context/Theme';
import {
    useBinding_resourceConfigOfMetaBindingProperty,
    useBinding_toggleDisable,
} from 'src/stores/Binding/hooks';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

function BindingsSelectorToggle({ bindingUUID }: BindingsSelectorToggleProps) {
    const intl = useIntl();

    const formActive = useFormStateStore_isActive();

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
            disabled={formActive}
            sx={dataGridEntireCellButtonStyling}
            variant="text"
            onClick={() => {
                toggleDisable(bindingUUID);
            }}
        >
            <Switch
                disabled={formActive}
                size="small"
                checked={!disabled}
                color="success"
                id={`binding-toggle__${bindingUUID}`}
            />
        </Button>
    );
}

export default BindingsSelectorToggle;
