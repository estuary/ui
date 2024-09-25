import { Stack, Typography } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import AlertBox from 'components/shared/AlertBox';
import { useIntl } from 'react-intl';
import ReviewTable from './ReviewTable';

function ReviewSelection() {
    const intl = useIntl();

    return (
        <Stack spacing={2}>
            <AlertBox
                short
                severity="warning"
                title={intl.formatMessage({
                    id: 'dataFlowReset.reviewSelection.warning.title',
                })}
            >
                <MessageWithLink messageID="dataFlowReset.reviewSelection.warning.message" />
            </AlertBox>

            <Typography>
                {intl.formatMessage({
                    id: 'dataFlowReset.reviewSelection.instructions',
                })}
            </Typography>

            <ReviewTable />
        </Stack>
    );
}

export default ReviewSelection;
