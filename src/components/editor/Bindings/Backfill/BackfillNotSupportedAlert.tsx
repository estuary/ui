import { Box } from '@mui/material';

import MessageWithLink from 'src/components/content/MessageWithLink';
import AlertBox from 'src/components/shared/AlertBox';
import { useEntityType } from 'src/context/EntityContext';

function BackfillNotSupportedAlert() {
    const entityType = useEntityType();

    return (
        <Box sx={{ mt: 3, maxWidth: 'fit-content' }}>
            <AlertBox
                severity="info"
                short
                title={`This ${entityType} doesn't support backfills.`}
            >
                <MessageWithLink messageID="workflows.collectionSelector.manualBackfill.notSupported.message" />
            </AlertBox>
        </Box>
    );
}

export default BackfillNotSupportedAlert;
