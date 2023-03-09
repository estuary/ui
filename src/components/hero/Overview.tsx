import { Button, Grid, Typography } from '@mui/material';
import MessageWithEmphasis from 'components/content/MessageWithEmphasis';
import { NavArrowRight } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { useHeroTabs } from './hooks';

function HeroOverview() {
    const { openDetails } = useHeroTabs();

    return (
        <>
            <Grid item xs={12} sx={{ mb: 0.25 }}>
                <Typography variant="subtitle1" align="center">
                    <MessageWithEmphasis messageID="home.hero.companyOverview.description" />
                </Typography>
            </Grid>

            <Grid
                item
                xs={12}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Button
                    endIcon={<NavArrowRight style={{ fontSize: 14 }} />}
                    onClick={openDetails}
                    sx={{ minWidth: 160 }}
                >
                    <FormattedMessage id="home.hero.companyOverview.cta" />
                </Button>
            </Grid>
        </>
    );
}

export default HeroOverview;
