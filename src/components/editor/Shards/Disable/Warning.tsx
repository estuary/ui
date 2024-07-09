import { Box } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useEntityType } from 'context/EntityContext';

import AlertBox from 'components/shared/AlertBox';

function ShardsDisableWarning() {
    const entityType = useEntityType();

    return (
        <Box
            sx={{
                'mb': 2,
                '& .MuiAlertTitle-root': {
                    textTransform: 'capitalize',
                },
            }}
        >
            <AlertBox
                short
                severity="warning"
                title={
                    <FormattedMessage
                        id="workflows.disable.autoEnabledAlert.title"
                        values={{
                            entityType,
                        }}
                    />
                }
            >
                <Box>
                    <FormattedMessage
                        id="workflows.disable.autoEnabledAlert.message"
                        values={{
                            entityType,
                        }}
                    />
                </Box>
                <Box>
                    <FormattedMessage
                        id="workflows.disable.autoEnabledAlert.instructions"
                        values={{
                            entityType,
                        }}
                    />
                </Box>
            </AlertBox>
        </Box>
    );
}

export default ShardsDisableWarning;
