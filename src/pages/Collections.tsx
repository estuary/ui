import { Plus } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router-dom';

import { Box, Button, SxProps, Theme, Toolbar } from '@mui/material';

import { authenticatedRoutes } from 'app/routes';

import CollectionsTable from 'components/tables/Collections';

import usePageTitle from 'hooks/usePageTitle';

const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    padding: 2,
};

const Collections = () => {
    usePageTitle({
        header: authenticatedRoutes.collections.title,
        headerLink: 'https://docs.estuary.dev/concepts/#collections',
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
                    to={authenticatedRoutes.collections.create.new.fullPath}
                >
                    <Button
                        size="large"
                        startIcon={<Plus style={{ fontSize: 14 }} />}
                    >
                        <FormattedMessage id="collectionsTable.cta.new" />
                    </Button>
                </NavLink>
            </Toolbar>
            <Box sx={boxStyling}>
                <CollectionsTable />
            </Box>
        </>
    );
};

export default Collections;
