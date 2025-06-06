import { Button, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import ManualSelection from 'src/components/shared/Entity/prompts/steps/dataFlowReset/SelectMaterialization/ManualSelection';
import { usePreSavePromptStore } from 'src/components/shared/Entity/prompts/store/usePreSavePromptStore';
import { useBindingStore } from 'src/stores/Binding/Store';

function NoMaterializationsFound() {
    const intl = useIntl();

    const [setBackfillDataflow] = useBindingStore((state) => [
        state.setBackfillDataFlow,
    ]);

    const [updateContext] = usePreSavePromptStore((state) => {
        return [state.updateContext];
    });

    return (
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
                        {intl.formatMessage({
                            id: 'resetDataFlow.materializations.empty.warning',
                        })}
                    </Typography>
                    <Stack
                        spacing={2}
                        direction="row"
                        style={{ justifyContent: 'space-between' }}
                    >
                        <ManualSelection />
                        <Button
                            style={{ alignSelf: 'end' }}
                            variant="text"
                            onClick={() => {
                                setBackfillDataflow(false);
                                updateContext({
                                    backfillTarget: null,
                                });
                            }}
                        >
                            {intl.formatMessage({
                                id: 'resetDataFlow.materializations.empty.skip',
                            })}
                        </Button>
                    </Stack>
                </Stack>
            </Stack>
        </AlertBox>
    );
}

export default NoMaterializationsFound;
