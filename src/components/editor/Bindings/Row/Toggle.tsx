import type { BindingsSelectorToggleProps } from 'src/components/editor/Bindings/Row/types';

import { useEffect, useState } from 'react';

import { Button, Switch, Tooltip } from '@mui/material';

import { useIntl } from 'react-intl';

import { TOGGLE_RESET_TOOLTIP_ID } from 'src/components/editor/Bindings/Row/shared';
import SpecPropInvalidSetting from 'src/components/shared/specPropEditor/SpecPropInvalidSetting';
import { dataGridEntireCellButtonStyling } from 'src/context/Theme';
import useDisableUpdater from 'src/hooks/bindings/useDisableUpdater';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

function BindingsSelectorToggle({ bindingUUID }: BindingsSelectorToggleProps) {
    const intl = useIntl();

    const formActive = useFormStateStore_isActive();

    const [invalidSetting, setInvalidSetting] = useState(false);

    const { currentSetting, updateDraft } = useDisableUpdater(bindingUUID);

    useEffect(() => {
        // If we are in the "toggle all" button skip checking
        if (!bindingUUID) {
            setInvalidSetting(false);
            return;
        }

        // Check if there is nothing in the store OR in the draft
        if (currentSetting === null || currentSetting === undefined) {
            setInvalidSetting(false);
            return;
        }

        // Make sure we have the type we want
        if (typeof currentSetting !== 'boolean') {
            setInvalidSetting(true);
            return;
        }

        // Just adding this as a fallthrough to be safe
        setInvalidSetting(false);
    }, [bindingUUID, currentSetting]);

    const labeledById = `${TOGGLE_RESET_TOOLTIP_ID}_bindingUUID`;

    if (invalidSetting) {
        return (
            <Tooltip
                arrow
                id={labeledById}
                placement="right"
                title={
                    <SpecPropInvalidSetting
                        currentSetting={currentSetting}
                        invalidSettingsMessageId="specPropUpdater.error.message.toggle"
                        updateDraftedSetting={() =>
                            updateDraft(bindingUUID, false, true)
                        }
                    />
                }
            >
                <Button
                    aria-labelledby={labeledById}
                    color="error"
                    disabled={formActive}
                    sx={dataGridEntireCellButtonStyling}
                    variant="text"
                >
                    {intl.formatMessage({
                        id: 'common.invalid',
                    })}
                </Button>
            </Tooltip>
        );
    }

    return (
        <Button
            aria-label={intl.formatMessage({
                id: currentSetting ? 'common.disabled' : 'common.enabled',
            })}
            disabled={formActive}
            sx={dataGridEntireCellButtonStyling}
            variant="text"
            onClick={() => updateDraft(bindingUUID)}
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
