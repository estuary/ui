import type { SpecPropInvalidSettingProps } from 'src/components/shared/specPropEditor/types';

import { Button, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { logRocketEvent } from 'src/services/shared';
import { stringifyJSON } from 'src/services/stringify';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

function SpecPropInvalidSetting({
    currentSetting,
    invalidSettingsMessageId,
    updateDraftedSetting,
}: SpecPropInvalidSettingProps) {
    const intl = useIntl();
    const formActive = useFormStateStore_isActive();

    const safeCurrentSetting =
        typeof currentSetting === 'string'
            ? currentSetting
            : stringifyJSON(currentSetting);

    return (
        <AlertBox severity="error" short sx={{ maxWidth: 'fit-content' }}>
            <Typography>
                {intl.formatMessage(
                    {
                        id: invalidSettingsMessageId,
                    },
                    {
                        currentSetting: safeCurrentSetting,
                    }
                )}
            </Typography>

            {updateDraftedSetting ? (
                <Button
                    disabled={formActive}
                    size="small"
                    sx={{ maxWidth: 'fit-content' }}
                    variant="text"
                    onClick={() => {
                        logRocketEvent('ResetInvalidSetting', {
                            currentSetting: safeCurrentSetting,
                            messageID: invalidSettingsMessageId,
                        });
                        return updateDraftedSetting();
                    }}
                >
                    {intl.formatMessage({
                        id: 'specPropEditor.error.cta',
                    })}
                </Button>
            ) : null}
        </AlertBox>
    );
}

export default SpecPropInvalidSetting;
