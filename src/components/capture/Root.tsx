import AddIcon from '@mui/icons-material/Add';
import { Button, Toolbar } from '@mui/material';
import CatalogList from 'components/CatalogList';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const CaptureRoot = () => {
    const [captureList] = useState([]);
    const [isLoading] = useState(false);

    return (
        <>
            <Toolbar
                sx={{
                    alignItems: 'center',
                    display: 'flex',
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
        </>
    );
};

export default CaptureRoot;
