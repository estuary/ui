import { Grid } from '@mui/material';
import MessageWithEmphasis from 'components/content/MessageWithEmphasis';
import HeroStep from './Step';

function HeroDemo() {
    return (
        <>
            <Grid item xs={4}>
                <HeroStep stepNumber={1} title="home.hero.1.title">
                    <MessageWithEmphasis messageID="home.hero.1.message" />
                </HeroStep>
            </Grid>

            <Grid item xs={4}>
                <HeroStep stepNumber={2} title="home.hero.2.title">
                    <MessageWithEmphasis messageID="home.hero.2.message" />
                </HeroStep>
            </Grid>

            <Grid item xs={4}>
                <HeroStep stepNumber={3} title="home.hero.3.title">
                    <MessageWithEmphasis messageID="home.hero.3.message" />
                </HeroStep>
            </Grid>
        </>
    );
}

export default HeroDemo;
