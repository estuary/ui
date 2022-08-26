import { Grid, Stack, SxProps, Theme, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    step: 'one' | 'two' | 'three';
    sx: SxProps<Theme>;
}

function Description({ sx, step }: Props) {
    return (
        <Grid item xs={4}>
            <Stack direction="column" sx={{ wordBreak: 'break-word', ...sx }}>
                <Typography variant="h3" component="span">
                    <FormattedMessage id={`home.hero.${step}.title`} />
                </Typography>
                <Typography variant="h6" component="span">
                    <FormattedMessage
                        id={`home.hero.${step}.message`}
                        values={{
                            emphasis: (
                                <strong>
                                    <FormattedMessage
                                        id={`home.hero.${step}.emphasis`}
                                    />
                                </strong>
                            ),
                        }}
                    />
                </Typography>
            </Stack>
        </Grid>
    );
}

export default Description;
