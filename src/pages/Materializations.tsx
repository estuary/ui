import AddIcon from '@mui/icons-material/Add';
import { Box, Button, SxProps, Theme, Toolbar } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import PageContainer from 'components/shared/PageContainer';
import MaterializationsTable from 'components/tables/Materializations';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router-dom';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

const Materializations = () => {
    useBrowserTitle('browserTitle.materializations');

    return (
        <PageContainer
            pageTitleProps={{
                header: authenticatedRoutes.materializations.title,
                headerLink:
                    'https://docs.estuary.dev/concepts/#materializations',
            }}
        >
            <Toolbar
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <NavLink
                    style={{ textDecoration: 'none' }}
                    to={authenticatedRoutes.materializations.create.fullPath}
                >
                    <Button size="large" startIcon={<AddIcon />}>
                        <FormattedMessage id="materializationsTable.cta.new" />
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
