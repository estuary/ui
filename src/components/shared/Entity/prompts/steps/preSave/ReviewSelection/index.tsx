import { useState } from 'react';

import { Button, Collapse, Stack } from '@mui/material';

import { useIntl } from 'react-intl';

import MessageWithLink from 'src/components/content/MessageWithLink';
import AlertBox from 'src/components/shared/AlertBox';
import CardWrapper from 'src/components/shared/CardWrapper';
import { useBindingStore } from 'src/stores/Binding/Store';
import DiffViewer from 'src/components/shared/Entity/prompts/steps/preSave/ReviewSelection/DiffViewer';
import ReviewTable from 'src/components/shared/Entity/prompts/steps/preSave/ReviewSelection/ReviewTable';

function ReviewSelection() {
    const intl = useIntl();

    const [showDiff, setShowDiff] = useState(false);

    const backfillDataflow = useBindingStore((state) => state.backfillDataFlow);

    return (
        <Stack spacing={2}>
            {backfillDataflow ? (
                <AlertBox
                    short
                    severity="warning"
                    title={intl.formatMessage({
                        id: 'resetDataFlow.reviewSelection.warning.title',
                    })}
                >
                    <MessageWithLink messageID="resetDataFlow.reviewSelection.warning.message" />
                </AlertBox>
            ) : null}

            <Button variant="text" onClick={() => setShowDiff(!showDiff)}>
                {intl.formatMessage({
                    id: showDiff
                        ? 'cta.resetDataFlow.hideDiff'
                        : 'cta.resetDataFlow.showDiff',
                })}
            </Button>

            <Collapse in={showDiff} unmountOnExit>
                <DiffViewer />
            </Collapse>

            <Collapse in={!showDiff}>
                <CardWrapper
                    message={intl.formatMessage({
                        id: backfillDataflow
                            ? 'resetDataFlow.reviewSelection.instructions'
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
