import { Box, Button, Stack } from '@mui/material';
import Status from 'components/shared/Entity/Status';
import { DetailsFormStoreNames, useZustandStore } from 'context/Zustand';
import { FormattedMessage } from 'react-intl';
import { CreateState, FormStatus } from 'stores/MiniCreate';

interface Props {
    close: any;
    detailsFormStoreName: DetailsFormStoreNames;
    materialize?: {
        action: any;
        title: string;
    };
}

function LogDialogActions({ close, materialize, detailsFormStoreName }: Props) {
    const formStatus = useZustandStore<
        CreateState,
        CreateState['formState']['status']
    >(detailsFormStoreName, (state) => state.formState.status);

    return (
        <>
            <Box
                sx={{
                    pl: 2,
                }}
            >
                <Status detailsFormStoreName={detailsFormStoreName} />
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
