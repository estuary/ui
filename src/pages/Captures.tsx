import AddIcon from '@mui/icons-material/Add';
import { Box, Button, SxProps, Theme, Toolbar } from '@mui/material';
import { captureRoute } from 'app/Authenticated';
import PageContainer from 'components/shared/PageContainer';
import CapturesTable from 'components/tables/Captures';
import { useIntl } from 'react-intl';
import { NavLink } from 'react-router-dom';
import { useTitle } from 'react-use';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

const Capture = () => {
    const intl = useIntl();
    useTitle(
        intl.formatMessage({
            id: 'browserTitle.captures',
        })
    );

    return (
        <PageContainer>
            <Toolbar
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <NavLink to={captureRoute.create.path}>
                    <Button
                        variant="contained"
                        size="large"
                        color="success"
                        startIcon={<AddIcon />}
                    >
                        New Capture
                    </Button>
                </NavLink>
            </Toolbar>
            <Box sx={boxStyling}>
                <CapturesTable />
            </Box>
        </PageContainer>
    );
};

export default Capture;
