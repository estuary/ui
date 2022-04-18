import { Button, Stack, Toolbar, Typography } from '@mui/material';
import { routeDetails } from 'app/Authenticated';
import PageContainer from 'components/shared/PageContainer';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

function MaterializationCreate() {
    const navigate = useNavigate();

    const handlers = {
        close: () => {
            navigate(routeDetails.materializations.path);
        },
    };

    return (
        <PageContainer>
            {/* This toolbar is akin to ./capture/Header.tsx */}
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Typography variant="h6" noWrap>
                    <FormattedMessage id="materializationCreation.heading" />
                </Typography>

                <Stack direction="row" alignItems="center" spacing={1}>
                    <Button color="error" onClick={handlers.close}>
                        <FormattedMessage id="cta.cancel" />
                    </Button>

                    <Button
                        color="success"
                        variant="contained"
                        disableElevation
                        disabled
                        onClick={handlers.close}
                    >
                        <FormattedMessage id="cta.saveEntity" />
                    </Button>
                </Stack>
            </Toolbar>
            Under Development
        </PageContainer>
    );
}

export default MaterializationCreate;
