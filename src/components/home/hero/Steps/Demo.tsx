import { Box, Grid } from '@mui/material';

import MessageWithEmphasis from 'src/components/content/MessageWithEmphasis';
import HeroBaseStep from 'src/components/home/hero/Steps/Base';

interface Props {
    step: number;
}

function DemoStep({ step }: Props) {
    return (
        <Grid size={{ xs: 4 }}>
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
