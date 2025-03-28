import { Button, Grid } from '@mui/material';
import { authenticatedRoutes } from 'src/app/routes';
import { Plus } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router-dom';
import DetailStep from './Steps/Detail';

function HeroDetail() {
    return (
        <>
            <DetailStep step={1} title="terms.capture" />

            <Grid
                item
                xs={4}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <NavLink
                    style={{ textDecoration: 'none' }}
                    to={authenticatedRoutes.captures.create.fullPath}
                >
                    <Button
                        startIcon={<Plus style={{ fontSize: 14 }} />}
                        sx={{ minWidth: 160 }}
                    >
                        <FormattedMessage id="home.hero.companyDetails.cta" />
                    </Button>
                </NavLink>
            </Grid>

            <DetailStep step={2} title="terms.materialization" />
        </>
    );
}

export default HeroDetail;
