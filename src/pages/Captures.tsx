import type { SxProps, Theme } from '@mui/material';

import { Box, Button, Toolbar } from '@mui/material';

import { Plus } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { NavLink } from 'react-router-dom';

import { authenticatedRoutes } from 'src/app/routes';
import CapturesTable from 'src/components/tables/Captures';
import usePageTitle from 'src/hooks/usePageTitle';

// Vertical padding only — PageContainer already owns the page's left edge.
const boxStyling: SxProps<Theme> = { marginBottom: 2, paddingY: 2 };

const Capture = () => {
    usePageTitle({
        header: authenticatedRoutes.captures.title,
        headerLink: 'https://docs.estuary.dev/concepts/#captures',
    });

    const intl = useIntl();

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
                    to={authenticatedRoutes.captures.create.fullPath}
                >
                    <Button
                        size="large"
                        startIcon={<Plus style={{ fontSize: 14 }} />}
                    >
                        {intl.formatMessage({
                            id: 'capturesTable.cta.new',
                        })}
                    </Button>
                </NavLink>
            </Toolbar>

            <Box sx={boxStyling}>
                <CapturesTable />
            </Box>
        </>
    );
};

export default Capture;
