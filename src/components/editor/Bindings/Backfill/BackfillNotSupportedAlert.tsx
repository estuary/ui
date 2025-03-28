import { Box } from '@mui/material';
import MessageWithLink from 'src/components/content/MessageWithLink';
import AlertBox from 'src/components/shared/AlertBox';
import { useEntityType } from 'src/context/EntityContext';
import { useIntl } from 'react-intl';

function BackfillNotSupportedAlert() {
    const intl = useIntl();
    const entityType = useEntityType();

    return (
        <Box sx={{ mt: 3, maxWidth: 'fit-content' }}>
            <AlertBox
                severity="info"
                short
                title={intl.formatMessage(
                    {
                        id: 'workflows.collectionSelector.manualBackfill.notSupported.title',
                    },
                    { entityType }
                )}
            >
                <MessageWithLink messageID="workflows.collectionSelector.manualBackfill.notSupported.message" />
            </AlertBox>
        </Box>
    );
}

export default BackfillNotSupportedAlert;
