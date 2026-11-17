import { alertTitleClasses, Box } from '@mui/material';

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
                    mb: 2,
                    [`& .${alertTitleClasses.root}`]: {
                        textTransform: 'capitalize',
                    },
                }}
            >
                <AlertBox
                    short
                    severity="warning"
                    title={`${entityType} enabled`}
                >
                    <Box>
                        {`We have automatically enabled this ${entityType} to ensure we can test the connection with the endpoint.`}
                    </Box>
                    <Box>
                        {`To keep the ${entityType} disabled you will need to disable before publishing.`}
                    </Box>
                </AlertBox>
            </Box>
        );
    }

    return null;
}

export default ShardsDisableWarning;
