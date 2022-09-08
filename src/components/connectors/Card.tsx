import { Cable } from '@mui/icons-material';
import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { imageBackgroundSx } from 'components/ConnectorTiles';
import ExternalLink from 'components/shared/ExternalLink';
import {
    darkGlassBkgColor,
    darkGlassBkgColorIntensified,
    slate,
} from 'context/Theme';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { BaseComponentProps, EntityWithCreateWorkflow } from 'types';

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
                    theme.palette.mode === 'dark'
                        ? darkGlassBkgColor
                        : slate[50],
                'padding': 1,
                'height': '100%',
                '&:hover': {
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? darkGlassBkgColorIntensified
                            : 'rgba(172, 199, 220, 0.45)',
                },
            }}
        >
            {children}
        </Paper>
    );
}

interface Props {
    description: string;
    docsUrl: string;
    imageSrc: string | null | undefined;
    lastUpdate: any;
    title: string;
    entity: EntityWithCreateWorkflow;
    ctaCallback: Function;
}
function ConnectorCard({
    ctaCallback,
    docsUrl,
    entity,
    imageSrc,
    lastUpdate,
    title,
    description,
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
                        <Box sx={imageBackgroundSx}>
                            <Stack
                                sx={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Box>
                                    {imageSrc ? (
                                        <img
                                            src={imageSrc}
                                            loading="lazy"
                                            alt=""
                                            style={{
                                                width: 'auto',
                                                maxHeight: 75,
                                                padding: '0 1rem',
                                            }}
                                        />
                                    ) : (
                                        <Cable sx={{ fontSize: '4rem' }} />
                                    )}
                                </Box>

                                {docsUrl ? (
                                    <ExternalLink link={docsUrl}>
                                        <FormattedMessage id="terms.documentation" />
                                    </ExternalLink>
                                ) : null}
                            </Stack>
                        </Box>

                        <Typography
                            component="div"
                            variant="h5"
                            marginBottom={1}
                        >
                            {title}
                        </Typography>

                        <Stack
                            direction="column"
                            spacing={1}
                            sx={{
                                alignItems: 'baseline',
                            }}
                        >
                            <Typography component="div" variant="subtitle1">
                                <span
                                    style={{
                                        marginRight: '.5rem',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    <FormattedMessage id="entityTable.data.lastUpdatedWithColon" />
                                </span>

                                <FormattedDate
                                    day="numeric"
                                    month="long"
                                    year="numeric"
                                    value={lastUpdate}
                                />
                            </Typography>

                            <Typography component="div" variant="subtitle1">
                                {description}
                            </Typography>
                        </Stack>
                    </Box>

                    <Button
                        sx={{ justifySelf: 'flex-end' }}
                        onClick={() => ctaCallback()}
                    >
                        {entity === 'capture' ? (
                            <FormattedMessage id="connectorTable.actionsCta.capture" />
                        ) : (
                            <FormattedMessage id="connectorTable.actionsCta.materialization" />
                        )}
                    </Button>
                </Stack>
            </Tile>
        </Grid>
    );
}

export default ConnectorCard;
