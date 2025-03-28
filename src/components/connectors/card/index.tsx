import { ReactNode } from 'react';

import { Box, Grid, Stack, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import ExternalLink from 'src/components/shared/ExternalLink';
import Tile from 'src/components/shared/Tile';
import {
    connectorImageBackgroundRadius,
    connectorImageBackgroundSx,
    sample_grey,
} from 'src/context/Theme';

interface Props {
    logo: ReactNode;
    details: ReactNode;
    title: ReactNode;
    clickHandler?: () => void;
    cta?: ReactNode;
    docsUrl?: string;
    externalLink?: { href: string; target: string; rel: string };
    recommended?: boolean;
    specType?: string;
}
function ConnectorCard({
    cta,
    docsUrl,
    logo,
    title,
    details,
    recommended,
    clickHandler,
    externalLink,
    specType,
}: Props) {
    return (
        <Grid item xs={2} md={4} lg={2} xl={2}>
            <Tile clickHandler={clickHandler} externalLink={externalLink}>
                <Stack
                    sx={{
                        mb: 3,
                        height: '100%',
                        justifyContent: 'space-between',
                    }}
                >
                    <Box>
                        <Stack
                            sx={{
                                marginBottom: recommended ? 1 : 2,
                            }}
                        >
                            <Stack
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                sx={
                                    recommended
                                        ? {
                                              ...connectorImageBackgroundSx,
                                              mb: 0,
                                              borderBottomLeftRadius: 0,
                                              borderBottomRightRadius: 0,
                                          }
                                        : connectorImageBackgroundSx
                                }
                            >
                                {logo}

                                {docsUrl ? (
                                    <ExternalLink link={docsUrl}>
                                        <FormattedMessage id="terms.documentation" />
                                    </ExternalLink>
                                ) : null}
                            </Stack>

                            {recommended ? (
                                <Box
                                    sx={{
                                        bgcolor: sample_grey[400],
                                        color: 'black',
                                        fontWeight: 500,
                                        borderBottomLeftRadius:
                                            connectorImageBackgroundRadius,
                                        borderBottomRightRadius:
                                            connectorImageBackgroundRadius,
                                        textAlign: 'center',
                                    }}
                                >
                                    <FormattedMessage id="common.recommended" />
                                </Box>
                            ) : null}
                        </Stack>

                        {title}

                        {details}
                    </Box>

                    {specType ? (
                        <Typography
                            component="div"
                            sx={{
                                p: 1,
                                fontSize: 16,
                                color: (theme) =>
                                    theme.palette.mode === 'light'
                                        ? sample_grey[100]
                                        : sample_grey[900],
                                backgroundColor: (theme) =>
                                    theme.palette.primary.main,
                                borderRadius: 2,
                            }}
                        >
                            <FormattedMessage id={`terms.${specType}`} />
                        </Typography>
                    ) : null}

                    {cta}
                </Stack>
            </Tile>
        </Grid>
    );
}

export default ConnectorCard;
