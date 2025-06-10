import type { CardProps } from 'src/components/connectors/Grid/cards/types';

import { Box, Grid, Stack } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import ExternalLink from 'src/components/shared/ExternalLink';
import Tile from 'src/components/shared/Tile';
import {
    connectorImageBackgroundRadius,
    connectorImageBackgroundSx,
    sample_grey,
} from 'src/context/Theme';

// TODO: Determine a means to handle connector title names.
export default function Card({
    clickHandler,
    Detail,
    docsUrl,
    externalLink,
    Logo,
    Title,
    recommended,
}: CardProps) {
    return (
        <Grid item xs={2} md={4} lg={3} xl={2}>
            <Tile clickHandler={clickHandler} externalLink={externalLink}>
                <Stack>
                    <Stack
                        direction="row"
                        spacing={1}
                        style={{ alignItems: 'flex-start' }}
                    >
                        <Stack
                            style={{
                                marginBottom: recommended ? 1 : 2,
                                width: 100,
                            }}
                        >
                            <Stack
                                style={{
                                    height: 50,
                                    padding: '8px 0px',
                                    width: 'inherit',
                                }}
                                sx={
                                    recommended
                                        ? {
                                              ...connectorImageBackgroundSx,
                                              borderBottomLeftRadius: 0,
                                              borderBottomRightRadius: 0,
                                              mb: 0,
                                          }
                                        : connectorImageBackgroundSx
                                }
                            >
                                {Logo}
                            </Stack>

                            {recommended ? (
                                <Box
                                    style={{
                                        backgroundColor: sample_grey[400],
                                        borderBottomLeftRadius:
                                            connectorImageBackgroundRadius,
                                        borderBottomRightRadius:
                                            connectorImageBackgroundRadius,
                                        color: 'black',
                                        fontWeight: 500,
                                        textAlign: 'center',
                                    }}
                                >
                                    <FormattedMessage id="common.recommended" />
                                </Box>
                            ) : null}
                        </Stack>

                        <Stack
                            className="connector-info"
                            style={{ flexGrow: 1 }}
                        >
                            <Stack
                                sx={{
                                    'alignItems': 'flex-start',
                                    '.connector-title': {
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        width: 200,
                                    },
                                }}
                            >
                                {' '}
                                {Title}
                                {docsUrl ? (
                                    <Box>
                                        <ExternalLink link={docsUrl}>
                                            <FormattedMessage id="terms.documentation" />
                                        </ExternalLink>
                                    </Box>
                                ) : null}
                            </Stack>

                            {Detail}
                        </Stack>
                    </Stack>
                </Stack>
            </Tile>
        </Grid>
    );
}
