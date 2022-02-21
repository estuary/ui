import AddIcon from '@mui/icons-material/Add';
import { Button, Toolbar } from '@mui/material';
import CatalogList from 'components/CatalogList';
import PageContainer from 'components/shared/PageContainer';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const Capture: React.FC = () => {
    const [captureList] = useState([]);
    const [isLoading] = useState(false);

    return (
        <PageContainer>
            <Toolbar
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <NavLink to="new">
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
            <CatalogList captures={captureList} isLoading={isLoading} />
            <Outlet />
        </PageContainer>
    );
};

export default Capture;
