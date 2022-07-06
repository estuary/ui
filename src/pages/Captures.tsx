import AddIcon from '@mui/icons-material/Add';
import { Box, Button, SxProps, Theme, Toolbar } from '@mui/material';
import { authenticatedRoutes } from 'app/Authenticated';
import PageContainer from 'components/shared/PageContainer';
import CapturesTable from 'components/tables/Captures';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router-dom';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

const Capture = () => {
    useBrowserTitle('browserTitle.captures');

    return (
        <PageContainer>
            <Toolbar
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <NavLink
                    style={{ textDecoration: 'none' }}
                    to={authenticatedRoutes.captures.create.fullPath}
                >
                    <Button size="large" startIcon={<AddIcon />}>
                        <FormattedMessage id="capturesTable.cta.new" />
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
