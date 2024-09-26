import { Button, Collapse, Stack, Typography } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import AlertBox from 'components/shared/AlertBox';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import DiffViewer from '../../preSave/ChangeReview/DiffViewer';
import ReviewTable from './ReviewTable';

function ReviewSelection() {
    const intl = useIntl();

    const [showDiff, setShowDiff] = useState(false);

    return (
        <Stack>
            <AlertBox
                short
                severity="warning"
                title={intl.formatMessage({
                    id: 'dataFlowReset.reviewSelection.warning.title',
                })}
            >
                <MessageWithLink messageID="dataFlowReset.reviewSelection.warning.message" />
            </AlertBox>

            <Button onClick={() => setShowDiff(!showDiff)}>
                {showDiff ? 'Hide Diff' : 'Show Diff'}
            </Button>

            <Collapse in={showDiff} unmountOnExit>
                <DiffViewer />
            </Collapse>

            <Collapse in={!showDiff}>
                <Typography>
                    {intl.formatMessage({
                        id: 'dataFlowReset.reviewSelection.instructions',
                    })}
                </Typography>

                <ReviewTable />
            </Collapse>
        </Stack>
    );
}

export default ReviewSelection;
