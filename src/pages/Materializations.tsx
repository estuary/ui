import AddIcon from '@mui/icons-material/Add';
import { Button, Toolbar } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import { NavLink, Outlet } from 'react-router-dom';

const Materializations = () => {
    return (
        <PageContainer>
            <Toolbar
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <NavLink to="/materialization/create">
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
