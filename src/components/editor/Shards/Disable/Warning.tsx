import { Box } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useEntityType } from 'context/EntityContext';

import AlertBox from 'components/shared/AlertBox';

function ShardsDisableWarning() {
    const entityType = useEntityType();

    return (
        <Box sx={{ mb: 2 }}>
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
                <FormattedMessage
                    id="workflows.disable.autoEnabledAlert.message"
                    values={{
                        entityType,
                    }}
                />
            </AlertBox>
        </Box>
    );
}

export default ShardsDisableWarning;
