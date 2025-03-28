import { Grid } from '@mui/material';

import HeroStep from '../Step';
import { FormattedMessage } from 'react-intl';

interface Props {
    step: number;
    title: string;
}

function DetailStep({ step, title }: Props) {
    return (
        <Grid item xs={4}>
            <HeroStep stepNumber={step} title={title}>
                <FormattedMessage id={`home.hero.companyDetails.step${step}`} />
            </HeroStep>
        </Grid>
    );
}

export default DetailStep;
