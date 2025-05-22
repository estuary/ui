import type { BindingsSelectorToggleProps } from 'src/components/editor/Bindings/Row/types';

import { Button, Switch } from '@mui/material';

import { useIntl } from 'react-intl';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import { dataGridEntireCellButtonStyling } from 'src/context/Theme';
import useDisableUpdater from 'src/hooks/bindings/useDisableUpdater';
import { useBinding_resourceConfigOfMetaBindingProperty } from 'src/stores/Binding/hooks';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

function BindingsSelectorToggle({
    bindingIndex,
    bindingUUID,
}: BindingsSelectorToggleProps) {
    const intl = useIntl();

    const formActive = useFormStateStore_isActive();

    const { updateDraft } = useDisableUpdater();

    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    // TODO (disable) how do we want to handle an invalid setting?
    const draftedSetting =
        draftSpecs?.[0]?.spec?.bindings?.[bindingIndex]?.disable;

    const storeSetting = useBinding_resourceConfigOfMetaBindingProperty(
        bindingUUID,
        'disable'
    );

    const currentSetting = draftedSetting ?? storeSetting;

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
