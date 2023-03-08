import { Grid } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import ExternalLink from 'components/shared/ExternalLink';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';
import { getPathWithParams } from 'utils/misc-utils';
import DemoButton from './DemoButton';
import DemoStep from './Steps/Demo';

function HeroDemo() {
    const navigate = useNavigate();

    return (
        <>
            <Grid container>
                <DemoStep step={1} />
                <DemoStep step={2} />
                <DemoStep step={3} />
            </Grid>
            <Grid container>
                <DemoButton
                    step={1}
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
                />

                <DemoButton
                    step={2}
                    onClick={() => {
                        navigate(
                            getPathWithParams(
                                authenticatedRoutes.collections.fullPath,
                                {
                                    'col-sq':
                                        'estuary/wikipedia/derivation-data-change',
                                }
                            )
                        );
                    }}
                />

                <DemoButton
                    step={3}
                    onClick={() => {
                        navigate(
                            getPathWithParams(
                                authenticatedRoutes.materializations.fullPath,
                                {
                                    'mat-sq': 'estuary/dave-wiki-lines',
                                }
                            )
                        );
                    }}
                />
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
                <ExternalLink
                    color="primary"
                    sx={{
                        py: 2,
                        px: 4,
                    }}
                    variant="contained"
                    link="https://docs.google.com/spreadsheets/d/1Cd_afDejaVXKeGxSTCupKaTtrb3a7ZHBghTemDNKE5I/edit#gid=0"
                >
                    <FormattedMessage id="home.hero.button" />
                </ExternalLink>
            </Grid>
        </>
    );
}

export default HeroDemo;
