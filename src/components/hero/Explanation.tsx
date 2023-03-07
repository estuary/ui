import { Button, Grid } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import Step from 'components/hero/Step';
import { Plus } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router-dom';

function HeroExplanation() {
    return (
        <>
            <Grid item xs={4}>
                <Step stepNumber={1} entityType="capture" />
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
                <Step stepNumber={2} entityType="materialization" />
            </Grid>
        </>
    );
}

export default HeroExplanation;
