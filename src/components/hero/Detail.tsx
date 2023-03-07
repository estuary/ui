import { Button, Grid } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import { Plus } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router-dom';
import HeroStep from './Step';

function HeroDetail() {
    return (
        <>
            <Grid item xs={4}>
                <HeroStep stepNumber={1} title="terms.capture">
                    <FormattedMessage id="home.hero.companyDetails.step1" />
                </HeroStep>
            </Grid>

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

            <Grid item xs={4}>
                <HeroStep stepNumber={2} title="terms.materialization">
                    <FormattedMessage id="home.hero.companyDetails.step2" />
                </HeroStep>
            </Grid>
        </>
    );
}

export default HeroDetail;
