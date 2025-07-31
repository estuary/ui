import { Box } from '@mui/material';

import { useIntl } from 'react-intl';

import usePrivacySettings from 'src/_compliance/hooks/usePrivacySettings';
import { truncateTextSx } from 'src/context/Theme';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

function EnhancedSupportChip() {
    const intl = useIntl();
    const { enhancedSupportEnabled, enhancedSupportExpiration, revokeAccess } =
        usePrivacySettings();

    if (!enhancedSupportEnabled) {
        return null;
    }

    return (
        <OutlinedChip
            color="success"
            label={
                <Box
                    sx={{
                        ...truncateTextSx,
                        minWidth: 100,
                        p: 1,
                    }}
                >
                    {intl.formatMessage(
                        { id: 'supportConsent.enhancedSupport.enabled' },
                        {
                            expiration: enhancedSupportExpiration,
                        }
                    )}
                </Box>
            }
            onDelete={revokeAccess}
            style={{
                maxWidth: '50%',
                minHeight: 40,
            }}
            variant="outlined"
        />
    );
}

export default EnhancedSupportChip;
