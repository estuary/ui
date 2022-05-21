import { Box, Button, Stack } from '@mui/material';
import Status from 'components/shared/Entity/Status';
import { useRouteStore } from 'hooks/useRouteStore';
import { FormattedMessage } from 'react-intl';
import { entityCreateStoreSelectors, FormStatus } from 'stores/Create';

interface Props {
    close: any;
    materialize?: {
        action: any;
        title: string;
    };
}

function LogDialogActions({ close, materialize }: Props) {
    const entityCreateStore = useRouteStore();

    const formStatus = entityCreateStore(
        entityCreateStoreSelectors.formState.status
    );

    return (
        <>
            <Box
                sx={{
                    pl: 2,
                }}
            >
                <Status />
            </Box>

            <Stack direction="row" spacing={2}>
                <Button onClick={close}>
                    <FormattedMessage id="cta.close" />
                </Button>

                {materialize ? (
                    <Button
                        disabled={formStatus !== FormStatus.SUCCESS}
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
