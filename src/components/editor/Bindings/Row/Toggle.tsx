import type { BindingsSelectorToggleProps } from 'src/components/editor/Bindings/Row/types';

import { Button, Switch } from '@mui/material';

import { useIntl } from 'react-intl';

import { dataGridEntireCellButtonStyling } from 'src/context/Theme';
import useDisableUpdater from 'src/hooks/bindings/useDisableUpdater';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

function BindingsSelectorToggle({
    bindingIndex,
    bindingUUID,
}: BindingsSelectorToggleProps) {
    const intl = useIntl();

    const formActive = useFormStateStore_isActive();

    const { currentSetting, updateDraft } = useDisableUpdater(bindingUUID);

    console.log('currentSetting', currentSetting);

    return (
        <Button
            aria-label={intl.formatMessage({
                id: currentSetting ? 'common.disabled' : 'common.enabled',
            })}
            disabled={formActive}
            sx={dataGridEntireCellButtonStyling}
            variant="text"
            onClick={() => {
                updateDraft(bindingUUID);
            }}
        >
            <Switch
                disabled={formActive}
                size="small"
                checked={!currentSetting}
                color="success"
                id={`binding-toggle__${bindingUUID}`}
            />
        </Button>
    );
}

export default BindingsSelectorToggle;
