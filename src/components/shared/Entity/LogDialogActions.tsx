import { Box, Button, SxProps, Theme } from '@mui/material';
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

const buttonSX: SxProps<Theme> = {
    mx: 1,
};

function LogDialogActions({ close, materialize }: Props) {
    const entityCreateStore = useRouteStore();

    const formStatus = entityCreateStore(
        entityCreateStoreSelectors.formState.status
    );

    console.log(formStatus);

    return (
        <>
            <Box
                sx={{
                    pl: 2,
                }}
            >
                <Status />
            </Box>

            <Box>
                <Button
                    disabled={
                        formStatus === FormStatus.TESTING ||
                        formStatus === FormStatus.SAVING
                    }
                    onClick={close}
                    sx={buttonSX}
                >
                    <FormattedMessage id="cta.close" />
                </Button>

                {materialize ? (
                    <Button
                        disabled={formStatus !== FormStatus.SUCCESS}
                        onClick={materialize.action}
                        sx={buttonSX}
                    >
                        <FormattedMessage id={materialize.title} />
                    </Button>
                ) : null}
            </Box>
        </>
    );
}

export default LogDialogActions;
