import { Box, Button, Stack } from '@mui/material';
import Status from 'components/shared/Entity/Status';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_status } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';

interface Props {
    close: any;
    closeCtaKey?: string;
    materialize?: {
        action: any;
        title: string;
    };
}

function LogDialogActions({ close, closeCtaKey, materialize }: Props) {
    const formStatus = useFormStateStore_status();

    return (
        <>
            <Box sx={{ pl: 2 }}>
                <Status />
            </Box>

            <Stack direction="row" spacing={2}>
                <Button onClick={close}>
                    <FormattedMessage id={closeCtaKey ?? 'cta.close'} />
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
