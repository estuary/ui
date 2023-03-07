import { Box, Button, Grid } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import MessageWithEmphasis from 'components/content/MessageWithEmphasis';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';
import { getPathWithParams } from 'utils/misc-utils';
import HeroStep from './Step';

function HeroDemo() {
    const navigate = useNavigate();

    return (
        <>
            <Grid item xs={4}>
                <HeroStep stepNumber={1} title="home.hero.1.title">
                    <Box
                        sx={{
                            textAlign: 'center',
                        }}
                    >
                        <MessageWithEmphasis messageID="home.hero.1.message" />

                        <Button
                            onClick={() => {
                                //estuary/wikipedia
                                navigate(
                                    getPathWithParams(
                                        authenticatedRoutes.captures.fullPath,
                                        {
                                            'cap-sq': 'estuary/wikipedia',
                                        }
                                    )
                                );
                            }}
                            sx={{
                                mt: 2,
                            }}
                        >
                            <FormattedMessage id="home.hero.1.button" />
                        </Button>
                    </Box>
                </HeroStep>
            </Grid>

            <Grid item xs={4}>
                <HeroStep stepNumber={2} title="home.hero.2.title">
                    <Box
                        sx={{
                            textAlign: 'center',
                        }}
                    >
                        <MessageWithEmphasis messageID="home.hero.2.message" />

                        <Button
                            onClick={() => {
                                navigate(
                                    getPathWithParams(
                                        authenticatedRoutes.collections
                                            .fullPath,
                                        {
                                            'col-sq':
                                                'estuary/wikipedia/derivation-data-change',
                                        }
                                    )
                                );
                            }}
                            sx={{
                                mt: 2,
                            }}
                        >
                            <FormattedMessage id="home.hero.2.button" />
                        </Button>
                    </Box>
                </HeroStep>
            </Grid>

            <Grid item xs={4}>
                <HeroStep stepNumber={3} title="home.hero.3.title">
                    <Box
                        sx={{
                            textAlign: 'center',
                        }}
                    >
                        <MessageWithEmphasis messageID="home.hero.3.message" />

                        <Button
                            onClick={() => {
                                navigate(
                                    getPathWithParams(
                                        authenticatedRoutes.materializations
                                            .fullPath,
                                        {
                                            'mat-sq': 'estuary/dave-wiki-lines',
                                        }
                                    )
                                );
                            }}
                            sx={{
                                mt: 2,
                            }}
                        >
                            <FormattedMessage id="home.hero.3.button" />
                        </Button>
                    </Box>
                </HeroStep>
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
                <Button>See the demo</Button>
            </Grid>
        </>
    );
}

export default HeroDemo;
