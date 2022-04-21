import AddIcon from '@mui/icons-material/Add';
import { Button, Toolbar } from '@mui/material';
import { routeDetails } from 'app/Authenticated';
import PageContainer from 'components/shared/PageContainer';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { NavLink, Outlet } from 'react-router-dom';

const Materializations = () => {
    useBrowserTitle('browserTitle.materializations');

    return (
        <PageContainer>
            <Toolbar
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <NavLink to={routeDetails.materialization.create.path}>
                    <Button
                        variant="contained"
                        size="large"
                        color="success"
                        startIcon={<AddIcon />}
                    >
                        New Materialization
                    </Button>
                </NavLink>
            </Toolbar>
            <Outlet />
        </PageContainer>
    );
};

export default Materializations;
