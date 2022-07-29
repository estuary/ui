import { Box, Button, Stack } from '@mui/material';
import Status from 'components/shared/Entity/Status';
import { FormStateStoreNames, useZustandStore } from 'context/Zustand';
import { FormattedMessage } from 'react-intl';
import { EntityFormState, FormStatus } from 'stores/FormState';

interface Props {
    close: any;
    formStateStoreName: FormStateStoreNames;
    materialize?: {
        action: any;
        title: string;
    };
}

function LogDialogActions({ close, materialize, formStateStoreName }: Props) {
    const formStatus = useZustandStore<
        EntityFormState,
        EntityFormState['formState']['status']
    >(formStateStoreName, (state) => state.formState.status);

    return (
        <>
            <Box
                sx={{
                    pl: 2,
                }}
            >
                <Status formStateStoreName={formStateStoreName} />
            </Box>

            <Stack direction="row" spacing={2}>
                <Button onClick={close}>
                    <FormattedMessage id="cta.close" />
                </Button>

                {materialize ? (
                    <Button
                        disabled={formStatus !== FormStatus.SAVED}
                        onClick={materialize.action}
                    >
                        <FormattedMessage id={materialize.title} />
                    </Button>
                ) : null}
            </Stack>
        </>
    );
}

export default LogDialogActions;
