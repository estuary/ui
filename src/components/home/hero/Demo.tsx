import { Button, Grid } from '@mui/material';

import { OpenNewWindow } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import DemoButton from 'src/components/home/hero/DemoButton';
import DemoStep from 'src/components/home/hero/Steps/Demo';

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

            <Grid container size="grow">
                <DemoButton step={1} type="captures" />
                <DemoButton step={2} type="collections" />
                <DemoButton step={3} type="materializations" />
            </Grid>

            <Grid
                size={{ xs: 12 }}
                sx={{
                    display: 'flex',
                    alignContent: 'center',
                    justifyContent: 'center',
                    mt: 3,
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    endIcon={<OpenNewWindow style={{ fontSize: 10 }} />}
                    href={DEMO_URL}
                    target="_blank"
                    rel="noopener"
                    sx={{ py: 1, px: 3 }}
                >
                    <FormattedMessage id="home.hero.button" />
                </Button>
            </Grid>
        </>
    );
}

export default HeroDemo;
