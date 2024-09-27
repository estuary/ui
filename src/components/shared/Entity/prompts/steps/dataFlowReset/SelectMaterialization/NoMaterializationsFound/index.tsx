import { Button, Stack, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import AlertBox from 'components/shared/AlertBox';
import { usePreSavePromptStore } from 'components/shared/Entity/prompts/store/usePreSavePromptStore';
import ManualSelection from '../ManualSelection';

function NoMaterializationsFound() {
    const intl = useIntl();

    const [nextStep] = usePreSavePromptStore((state) => {
        return [state.nextStep];
    });

    return (
        <Stack spacing={2}>
            <AlertBox
                severity="info"
                short
                title={intl.formatMessage({
                    id: 'resetDataFlow.materializations.empty.header',
                })}
            >
                <Stack spacing={2}>
                    <Typography>
                        {intl.formatMessage({
                            id: 'resetDataFlow.materializations.empty.message',
                        })}
                    </Typography>

                    <Stack spacing={2}>
                        <Typography>
                            You can either manually select a materialization you
                            want to have updated or skip this step.
                        </Typography>
                        <Typography>
                            Skipping this step will only publish your changes to
                            the Capture and not do a full data flow backfill.
                        </Typography>
                        <Stack
                            spacing={2}
                            direction="row"
                            style={{ justifyContent: 'space-between' }}
                        >
                            <ManualSelection />
                            <Button
                                variant="text"
                                onClick={() => {
                                    nextStep(true);
                                }}
                            >
                                Skip
                            </Button>
                        </Stack>
                    </Stack>
                </Stack>
            </AlertBox>
        </Stack>
    );
}

export default NoMaterializationsFound;
