import type { BindingsSelectorToggleProps } from 'src/components/editor/Bindings/Row/types';

import { useEffect, useMemo, useState } from 'react';

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

    const selection = useMemo(() => {
        if (
            bindingUUID &&
            (!currentSetting || typeof currentSetting !== 'boolean')
        ) {
            return null;
        }

        return currentSetting;
    }, [bindingUUID, currentSetting]);

    useEffect(() => {
        // No setting at all so we're good
        if (!currentSetting) {
            setInvalidSetting(false);
            return;
        }

        // We have a setting but could not find a matching option
        //  Set a flag to show an error and empty out the input
        if (selection === null) {
            setInvalidSetting(true);
            return;
        }

        setInvalidSetting(false);
    }, [currentSetting, selection]);

    const labeledById = `${TOGGLE_RESET_TOOLTIP_ID}_bindingUUID`;

    if (invalidSetting) {
        return (
            <Tooltip
                id={labeledById}
                placement="right"
                title={
                    <SpecPropInvalidSetting
                        currentSetting={currentSetting}
                        invalidSettingsMessageId="specPropUpdater.error.message.toggle"
                        updateDraftedSetting={() => {
                            return Promise.resolve();
                        }}
                    />
                }
            >
                <Button
                    aria-labelledby={labeledById}
                    color="error"
                    sx={dataGridEntireCellButtonStyling}
                    onClick={() => updateDraft(bindingUUID, false)}
                    variant="text"
                >
                    {intl.formatMessage({ id: 'cta.reset' })}
                    {/*Invalid*/}
                </Button>
            </Tooltip>
        );
    }

    return (
        <Button
            aria-label={intl.formatMessage({
                id: selection ? 'common.disabled' : 'common.enabled',
            })}
            disabled={formActive}
            sx={dataGridEntireCellButtonStyling}
            variant="text"
            onClick={() => updateDraft(bindingUUID)}
        >
            <Switch
                disabled={formActive}
                size="small"
                checked={!selection}
                color="success"
                id={`binding-toggle__${bindingUUID}`}
            />
        </Button>
    );
}

export default BindingsSelectorToggle;
