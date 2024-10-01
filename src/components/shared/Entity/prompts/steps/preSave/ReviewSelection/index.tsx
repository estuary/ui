import { Button, Collapse, Stack } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import AlertBox from 'components/shared/AlertBox';
import CardWrapper from 'components/shared/CardWrapper';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useBindingStore } from 'stores/Binding/Store';
import DiffViewer from './DiffViewer';
import ReviewTable from './ReviewTable';

function ReviewSelection() {
    const intl = useIntl();

    const [showDiff, setShowDiff] = useState(false);

    const backfillDataflow = useBindingStore((state) => state.backfillDataFlow);

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

            <Button variant="text" onClick={() => setShowDiff(!showDiff)}>
                {intl.formatMessage({
                    id: showDiff
                        ? 'cta.dataFlowReset.hideDiff'
                        : 'cta.dataFlowReset.showDiff',
                })}
            </Button>

            <Collapse in={showDiff} unmountOnExit>
                <DiffViewer />
            </Collapse>

            <Collapse in={!showDiff}>
                <CardWrapper
                    message={intl.formatMessage({
                        id: backfillDataflow
                            ? 'dataFlowReset.reviewSelection.instructions'
                            : 'preSavePrompt.reviewSelection.instructions',
                    })}
                >
                    <ReviewTable />
                </CardWrapper>
            </Collapse>
        </Stack>
    );
}

export default ReviewSelection;
