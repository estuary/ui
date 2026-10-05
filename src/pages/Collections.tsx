import type { SxProps, Theme } from '@mui/material';

import { Box, Button, Toolbar } from '@mui/material';

import { Plus } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router-dom';

import { authenticatedRoutes } from 'src/app/routes';
import CollectionsTable from 'src/components/tables/Collections';
import usePageTitle from 'src/hooks/usePageTitle';

// Vertical padding only — PageContainer already owns the page's left edge.
const boxStyling: SxProps<Theme> = {
    marginBottom: 2,
    paddingY: 2,
};

const Collections = () => {
    usePageTitle({
        header: authenticatedRoutes.collections.title,
        headerLink: 'https://docs.estuary.dev/concepts/#collections',
    });

    return (
        <>
            <Toolbar
                disableGutters
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    // Toolbar carries a 56/64px min-height meant for an app
                    // bar. Here it is only a flex row, and that height centres
                    // the button, putting ~11px above it that Welcome and
                    // Admin do not have. Keyed by breakpoint because the height
                    // it overrides is itself a media query.
                    minHeight: { xs: 'unset', sm: 'unset' },
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
