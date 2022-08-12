import { Help } from '@mui/icons-material';
import { IconButton, Link, Stack, Toolbar, Typography } from '@mui/material';
import ConnectorTiles from 'components/ConnectorTiles';
import PageContainer from 'components/shared/PageContainer';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';

const Connectors = () => {
    useBrowserTitle('browserTitle.connectors');

    return (
        <PageContainer>
            <Toolbar>
                <Stack direction="row" spacing={1}>
                    <Typography variant="h6" align="center">
                        <FormattedMessage id="connectorTable.title" />
                    </Typography>

                    <Link
                        target="_blank"
                        rel="noopener"
                        href="https://docs.estuary.dev/concepts/#connectors"
                    >
                        <IconButton size="small">
                            <Help
                                sx={{
                                    color: (theme) =>
                                        theme.palette.text.primary,
                                }}
                            />
                        </IconButton>
                    </Link>
                </Stack>
            </Toolbar>

            <ConnectorTiles cardWidth={250} cardsPerRow={4} gridSpacing={2} />
        </PageContainer>
    );
};

export default Connectors;
