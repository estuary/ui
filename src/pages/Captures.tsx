import AddIcon from '@mui/icons-material/Add';
import { Box, Button, SxProps, Theme, Toolbar } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import CapturesTable from 'components/tables/Captures';
import { NavLink } from 'react-router-dom';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

const Capture = () => {
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
            <Box sx={boxStyling}>
                <CapturesTable />
            </Box>
        </PageContainer>
    );
};

export default Capture;
