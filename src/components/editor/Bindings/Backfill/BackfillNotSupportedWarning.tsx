import { Box } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { useEntityType } from 'context/EntityContext';
import { useIntl } from 'react-intl';

function BackfillNotSupportedWarning() {
    const intl = useIntl();
    const entityType = useEntityType();

    return (
        <Box sx={{ mt: 3, maxWidth: 'fit-content' }}>
            <AlertBox
                severity="warning"
                short
                title={intl.formatMessage(
                    {
                        id: 'workflows.collectionSelector.manualBackfill.notSupported.title',
                    },
                    { entityType }
                )}
            >
                {intl.formatMessage(
                    {
                        id: 'workflows.collectionSelector.manualBackfill.notSupported.message',
                    },
                    { entityType }
                )}
            </AlertBox>
        </Box>
    );
}

export default BackfillNotSupportedWarning;
