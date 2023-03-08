import { Box, Grid } from '@mui/material';
import MessageWithEmphasis from 'components/content/MessageWithEmphasis';
import HeroBaseStep from './Base';

interface Props {
    step: number;
}

function DemoStep({ step }: Props) {
    return (
        <Grid item xs={4}>
            <HeroBaseStep stepNumber={step} title={`home.hero.${step}.title`}>
                <Box
                    sx={{
                        textAlign: 'center',
                    }}
                >
                    <MessageWithEmphasis
                        messageID={`home.hero.${step}.message`}
                    />
                </Box>
            </HeroBaseStep>
        </Grid>
    );
}

export default DemoStep;
