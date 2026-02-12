import { Grid } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import HeroStep from 'src/components/home/hero/Step';

interface Props {
    step: number;
    title: string;
}

function DetailStep({ step, title }: Props) {
    return (
        <Grid size={{ xs: 4 }}>
            <HeroStep stepNumber={step} title={title}>
                <FormattedMessage id={`home.hero.companyDetails.step${step}`} />
            </HeroStep>
        </Grid>
    );
}

export default DetailStep;
