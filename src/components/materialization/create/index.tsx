import { Button, Stack, Toolbar, Typography } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

function NewMaterialization() {
    const navigate = useNavigate();

    const handlers = {
        close: () => {
            navigate('/materializations');
        },
    };

    return (
        <PageContainer>
            <Toolbar>
                <Typography variant="h6" noWrap>
                    <FormattedMessage id="materializationCreation.heading" />
                </Typography>

                <Stack
                    direction="row"
                    spacing={0}
                    alignItems="center"
                    sx={{
                        ml: 'auto',
                    }}
                >
                    <Button onClick={handlers.close} color="error">
                        <FormattedMessage id="cta.cancel" />
                    </Button>

                    <Button
                        onClick={handlers.close}
                        color="success"
                        variant="contained"
                        disableElevation
                        disabled
                    >
                        <FormattedMessage id="cta.saveEntity" />
                    </Button>
                </Stack>
            </Toolbar>
            Under Development
        </PageContainer>
    );
}

export default NewMaterialization;
