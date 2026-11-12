import { Button, Grid } from '@mui/material';

import { Plus } from 'iconoir-react';
import { NavLink } from 'react-router-dom';
import { useLeaf } from 'react-semantic-tree';

import { authenticatedRoutes } from 'src/app/routes';
import DetailStep from 'src/components/home/hero/Steps/Detail';

function HeroDetail() {
    const { ref } = useLeaf('New Capture');

    return (
        <>
            <DetailStep step={1} title="terms.capture" />

            <Grid
                size={{ xs: 4 }}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <NavLink
                    ref={ref}
                    style={{ textDecoration: 'none' }}
                    to={authenticatedRoutes.captures.create.fullPath}
                >
                    <Button
                        startIcon={<Plus style={{ fontSize: 14 }} />}
                        sx={{ minWidth: 160 }}
                    >
                        New capture
                    </Button>
                </NavLink>
            </Grid>

            <DetailStep step={2} title="terms.materialization" />
        </>
    );
}

export default HeroDetail;
