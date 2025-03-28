import { Box, Grid } from '@mui/material';

import HeroBaseStep from './Base';

import MessageWithEmphasis from 'src/components/content/MessageWithEmphasis';

interface Props {
    step: number;
}

function DemoStep({ step }: Props) {
    return (
        <Grid item xs={4}>
            <HeroBaseStep stepNumber={step} title={`home.hero.${step}.title`}>
                <Box
                    sx={{
                        px: 2,
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
