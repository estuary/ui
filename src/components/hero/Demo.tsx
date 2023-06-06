import { Grid } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import { FormattedMessage } from 'react-intl';
import DemoButton from './DemoButton';
import DemoStep from './Steps/Demo';

const DEMO_URL =
    'https://docs.google.com/spreadsheets/d/1Cd_afDejaVXKeGxSTCupKaTtrb3a7ZHBghTemDNKE5I/edit#gid=0';

function HeroDemo() {
    return (
        <>
            <Grid container>
                <DemoStep step={1} />
                <DemoStep step={2} />
                <DemoStep step={3} />
            </Grid>

            <Grid container>
                <DemoButton step={1} type="captures" />
                <DemoButton step={2} type="collections" />
                <DemoButton step={3} type="materializations" />
            </Grid>

            <Grid
                item
                xs={12}
                sx={{
                    display: 'flex',
                    alignContent: 'center',
                    justifyContent: 'center',
                    mt: 3,
                }}
            >
                <ExternalLink
                    color="primary"
                    sx={{
                        py: 1,
                        px: 3,
                    }}
                    variant="contained"
                    link={DEMO_URL}
                >
                    <FormattedMessage id="home.hero.button" />
                </ExternalLink>
            </Grid>
        </>
    );
}

export default HeroDemo;
