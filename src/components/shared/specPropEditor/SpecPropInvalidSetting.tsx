import type { SpecPropInvalidSettingProps } from 'src/components/shared/specPropEditor/types';

import { Button, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { stringifyJSON } from 'src/services/stringify';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

function SpecPropInvalidSetting({
    currentSetting,
    invalidSettingsMessageId,
    updateDraftedSetting,
}: SpecPropInvalidSettingProps) {
    const intl = useIntl();
    const formActive = useFormStateStore_isActive();

    return (
        <AlertBox severity="error" short sx={{ maxWidth: 'fit-content' }}>
            <Typography>
                {intl.formatMessage(
                    {
                        id: invalidSettingsMessageId,
                    },
                    {
                        currentSetting:
                            typeof currentSetting === 'string'
                                ? currentSetting
                                : stringifyJSON(currentSetting),
                    }
                )}
            </Typography>

            <Button
                disabled={formActive}
                size="small"
                sx={{ maxWidth: 'fit-content' }}
                variant="text"
                onClick={() => updateDraftedSetting()}
            >
                {intl.formatMessage({
                    id: 'specPropEditor.error.cta',
                })}
            </Button>
        </AlertBox>
    );
}

export default SpecPropInvalidSetting;
