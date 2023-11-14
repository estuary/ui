import { Box, Button, Stack } from '@mui/material';
import { useEditorStore_catalogName } from 'components/editor/Store/hooks';
import Status from 'components/shared/Entity/Status';
import { TaskEndpoint } from 'components/shared/TaskEndpoints';
import { FormattedMessage } from 'react-intl';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useFormStateStore_status } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';

interface Props {
    close: any;
    closeCtaKey?: string;
    taskNames?: string[];
    materialize?: {
        action: (catalogName: string) => Promise<void>;
        title: string;
    };
}

function LogDialogActions({
    close,
    closeCtaKey,
    taskNames,
    materialize,
}: Props) {
    const formStatus = useFormStateStore_status();
    const catalogName = useEditorStore_catalogName();

    // Only show endpoints after a completed publication, since publishing can potentially
    // change the endpoints.
    let endpoints = null;
    if (formStatus === FormStatus.SAVED) {
        endpoints = (
            <Box sx={{ pl: 2, display: 'flex', flexDirection: 'column' }}>
                {taskNames
                    ? taskNames.map((task) => (
                          <TaskEndpoint key={task} taskName={task} />
                      ))
                    : null}
            </Box>
        );
    }
    return (
        <>
            <Box sx={{ pl: 2 }}>
                <Status />
            </Box>
            {endpoints}
            <Stack direction="row" spacing={2}>
                <Button
                    variant={materialize ? 'outlined' : 'contained'}
                    onClick={close}
                >
                    <FormattedMessage id={closeCtaKey ?? 'cta.close'} />
                </Button>

                {materialize ? (
                    <Button
                        disabled={formStatus !== FormStatus.SAVED}
                        onClick={async () => {
                            logRocketEvent(
                                CustomEvents.CAPTURE_MATERIALIZE_ATTEMPT,
                                {
                                    catalogName,
                                }
                            );

                            await materialize.action(catalogName);
                        }}
                    >
                        <FormattedMessage id={materialize.title} />
                    </Button>
                ) : null}
            </Stack>
        </>
    );
}

export default LogDialogActions;
