import {
    Grid,
    Stack,
    SxProps,
    Theme,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface Props {
    step: 'one' | 'two' | 'three';
    sx: SxProps<Theme>;
}

function Description({ sx, step }: Props) {
    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Grid item xs={4}>
            <Stack direction="column" sx={{ wordBreak: 'break-word', ...sx }}>
                <Typography variant={belowMd ? 'h4' : 'h3'} component="span">
                    <FormattedMessage id={`home.hero.${step}.title`} />
                </Typography>
                <Typography variant={belowMd ? 'h6' : 'h5'} component="span">
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
