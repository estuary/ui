import { Box } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { useEntityType } from 'src/context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

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
