import { Box } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import AlertBox from 'components/shared/AlertBox';
import { useEntityType } from 'context/EntityContext';
import { useIntl } from 'react-intl';

function BackfillNotSupportedWarning() {
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

export default BackfillNotSupportedWarning;
