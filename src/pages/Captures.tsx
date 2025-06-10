import type { SxProps, Theme } from '@mui/material';

import { Box, Button, Toolbar } from '@mui/material';

import { Plus } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { NavLink } from 'react-router-dom';

import { authenticatedRoutes } from 'src/app/routes';
import CapturesTable from 'src/components/tables/Captures';
import usePageTitle from 'src/hooks/usePageTitle';

const boxStyling: SxProps<Theme> = { marginBottom: 2, padding: 2 };

const Capture = () => {
    usePageTitle({
        header: authenticatedRoutes.captures.title,
        headerLink: 'https://docs.estuary.dev/concepts/#captures',
    });

    const intl = useIntl();

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
