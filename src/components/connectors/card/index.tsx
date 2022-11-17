import { Box, Grid, Paper, Stack } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import {
    connectorImageBackgroundRadius,
    connectorImageBackgroundSx,
    semiTransparentBackground,
    semiTransparentBackgroundIntensified,
    teal,
} from 'context/Theme';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';

type TileProps = BaseComponentProps;
function Tile({ children }: TileProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                'borderRadius': 5,
                'maxWidth': 500,
                'flexGrow': 1,
                'background': (theme) =>
                    semiTransparentBackgroundIntensified[theme.palette.mode],
                'padding': 1,
                'height': '100%',
                '&:hover': {
                    background: (theme) =>
                        semiTransparentBackground[theme.palette.mode],
                },
            }}
        >
            {children}
        </Paper>
    );
}

interface Props {
    logo: ReactNode;
    details: ReactNode;
    cta: ReactNode;
    title: ReactNode;

    docsUrl?: string;
    recommended?: boolean;
}
function ConnectorCard({
    cta,
    docsUrl,
    logo,
    title,
    details,
    recommended,
}: Props) {
    return (
        <Grid item xs={2} md={4} lg={3} xl={2} sx={{ maxWidth: 275 }}>
            <Tile>
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
                            <Box
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
                                <Stack
                                    sx={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Box>{logo}</Box>

                                    {docsUrl ? (
                                        <ExternalLink link={docsUrl}>
                                            <FormattedMessage id="terms.documentation" />
                                        </ExternalLink>
                                    ) : null}
                                </Stack>
                            </Box>

                            {recommended ? (
                                <Box
                                    sx={{
                                        bgcolor: teal[700],
                                        color: 'white',
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

                    {cta}
                </Stack>
            </Tile>
        </Grid>
    );
}

export default ConnectorCard;
