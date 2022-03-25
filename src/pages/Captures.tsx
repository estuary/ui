import AddIcon from '@mui/icons-material/Add';
import { Button, Toolbar } from '@mui/material';
import CatalogList from 'components/CatalogList';
import PageContainer from 'components/shared/PageContainer';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Capture = () => {
    const [captureList] = useState([]);
    const [isLoading] = useState(false);

    return (
        <PageContainer>
            <Toolbar
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <NavLink to="/capture/create">
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
        </PageContainer>
    );
};

export default Capture;
