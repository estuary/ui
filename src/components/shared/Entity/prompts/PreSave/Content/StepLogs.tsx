import { Box } from '@mui/material';

import { useShallow } from 'zustand/react/shallow';

import { usePreSavePromptStore } from '../../store/usePreSavePromptStore';

import Logs from 'src/components/logs';
import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'src/context/LoopIndex/useLoopIndex';

function StepLogs() {
    const stepIndex = useLoopIndex();
    const [
        stepPublishable,
        stepFailed,
        stepSucceeded,
        logsToken,
        dataFlowResetPudId,
    ] = usePreSavePromptStore(
        useShallow((state) => {
            const currentState = state.steps[stepIndex].state;

            return [
                Boolean(currentState.publicationStatus),
                currentState.progress === ProgressStates.FAILED,
                currentState.progress === ProgressStates.SUCCESS,
                currentState.publicationStatus?.logs_token ?? null,
                state.context.dataFlowResetPudId,
            ];
        })
    );

    if (stepPublishable && Boolean(dataFlowResetPudId || stepFailed)) {
        return (
            <Box>
                <Logs
                    token={logsToken}
                    height={350}
                    loadingLineSeverity={stepFailed ? 'error' : 'success'}
                    spinnerMessages={{
                        runningKey: 'common.publishing',
                        stoppedKey: stepSucceeded
                            ? 'common.success'
                            : 'logs.noLogs',
                    }}
                />
            </Box>
        );
    }

    return null;
}

export default StepLogs;
