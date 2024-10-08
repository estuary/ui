import { Box } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useEntityType } from 'context/EntityContext';

import AlertBox from 'components/shared/AlertBox';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';

function ShardsDisableWarning() {
    const forcedToEnable = useGlobalSearchParams<number>(
        GlobalSearchParams.FORCED_SHARD_ENABLE
    );

    const entityType = useEntityType();

    if (forcedToEnable === 0) {
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

    return null;
}

export default ShardsDisableWarning;
