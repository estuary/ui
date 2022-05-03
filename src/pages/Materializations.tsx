import AddIcon from '@mui/icons-material/Add';
import { Box, Button, SxProps, Theme, Toolbar } from '@mui/material';
import { routeDetails } from 'app/Authenticated';
import PageContainer from 'components/shared/PageContainer';
import MaterializationsTable from 'components/tables/Materializations';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { NavLink } from 'react-router-dom';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

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
                <NavLink to={routeDetails.materialization.create.fullPath}>
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
            <Box sx={boxStyling}>
                <MaterializationsTable />
            </Box>
        </PageContainer>
    );
};

export default Materializations;
