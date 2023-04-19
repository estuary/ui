import { Box, Button, SxProps, Theme, Toolbar } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import MaterializationsTable from 'components/tables/Materializations';
import usePageTitle from 'hooks/usePageTitle';
import { Plus } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router-dom';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

const Materializations = () => {
    usePageTitle({
        header: authenticatedRoutes.materializations.title,
        headerLink: 'https://docs.estuary.dev/concepts/#materializations',
    });

    return (
        <>
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
                    <Button
                        size="large"
                        startIcon={<Plus style={{ fontSize: 14 }} />}
                    >
                        <FormattedMessage id="materializationsTable.cta.new" />
                    </Button>
                </NavLink>
            </Toolbar>

            <Box sx={boxStyling}>
                <MaterializationsTable />
            </Box>
        </>
    );
};

export default Materializations;
