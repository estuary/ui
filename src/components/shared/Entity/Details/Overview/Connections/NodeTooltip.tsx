import { Box, Divider, Popper, Stack, Typography } from '@mui/material';
import { Relationship } from 'components/graphs/ScopedSystemGraph';
import { paperBackground } from 'context/Theme';
import { CloudDownload, CloudUpload, DatabaseScript } from 'iconoir-react';
import { CSSProperties, ReactElement } from 'react';
import { FormatDateOptions, useIntl } from 'react-intl';
import { Entity } from 'types';
import { useScopedSystemGraph } from './Store/Store';

interface Props {
    anchorEl: HTMLElement | null;
}

const TIME_SETTINGS: FormatDateOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
};

const getEntityColor = (relationship: Relationship): string => {
    if (relationship === 'parent') {
        return 'rgba(83, 83, 204, 0.3)';
    }

    if (relationship === 'child') {
        return 'rgba(32, 140, 81, 0.4)';
    }

    return '#EFEFEF';
};

const getEntityIcon = (
    entityType: Entity,
    style?: CSSProperties
): ReactElement => {
    if (entityType === 'capture') {
        return <CloudUpload style={style} />;
    }

    if (entityType === 'materialization') {
        return <CloudDownload style={style} />;
    }

    return <DatabaseScript style={style} />;
};

function NodeTooltip({ anchorEl }: Props) {
    const intl = useIntl();

    const currentNode = useScopedSystemGraph((state) => state.currentNode);

    const entityColor = currentNode
        ? getEntityColor(currentNode.relationship)
        : '#343434';

    const entityIcon = currentNode ? getEntityIcon(currentNode.type) : null;

    return (
        <Popper
            key={`test-${anchorEl?.style.top}`}
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            placement="right-start"
        >
            <Box
                sx={{
                    m: 2,
                    p: 1,
                    borderRadius: 3,
                    boxShadow: 2,
                    bgcolor: (theme) => paperBackground[theme.palette.mode],
                }}
            >
                {currentNode ? (
                    <Stack direction="row" spacing={1}>
                        {entityIcon ? (
                            <Box style={{ marginTop: 6 }}>
                                <Box
                                    style={{
                                        alignItems: 'center',
                                        backgroundColor: entityColor,
                                        borderRadius: '50%',
                                        display: 'inline-flex',
                                        padding: 4,
                                    }}
                                >
                                    {entityIcon}
                                </Box>
                            </Box>
                        ) : null}

                        <Stack>
                            <Typography style={{ fontWeight: 500 }}>
                                {currentNode.name}
                            </Typography>

                            <Typography
                                variant="caption"
                                style={{ marginBottom: 16 }}
                            >
                                {`Updated ${intl.formatDate(
                                    '2024-06-04T14:48:41.346561+00:00',
                                    TIME_SETTINGS
                                )}`}
                            </Typography>

                            <Typography
                                variant="caption"
                                style={{
                                    marginBottom: 4,
                                }}
                            >
                                Monthly Usage
                            </Typography>

                            <Stack direction="row" spacing={1}>
                                <Box
                                    style={{
                                        alignItems: 'center',
                                        display: 'inline-flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Typography
                                        style={{
                                            // fontSize: 18,
                                            fontWeight: 500,
                                            paddingLeft: 4,
                                            paddingRight: 4,
                                        }}
                                    >
                                        23 GB
                                    </Typography>

                                    <Typography variant="caption">
                                        Data Read
                                    </Typography>
                                </Box>

                                <Divider orientation="vertical" />

                                <Box
                                    style={{
                                        alignItems: 'center',

                                        display: 'inline-flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Typography
                                        style={{
                                            fontWeight: 500,
                                            paddingLeft: 4,
                                            paddingRight: 4,
                                        }}
                                    >
                                        16 GB
                                    </Typography>

                                    <Typography variant="caption">
                                        Data Written
                                    </Typography>
                                </Box>

                                <Divider orientation="vertical" />

                                <Box
                                    style={{
                                        alignItems: 'center',
                                        display: 'inline-flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Typography
                                        style={{
                                            // fontSize: 18,
                                            fontWeight: 500,
                                            paddingLeft: 4,
                                            paddingRight: 4,
                                        }}
                                    >
                                        2.31 K
                                    </Typography>

                                    <Typography variant="caption">
                                        Docs Read
                                    </Typography>
                                </Box>

                                <Divider orientation="vertical" />

                                <Box
                                    style={{
                                        alignItems: 'center',
                                        display: 'inline-flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Typography
                                        style={{
                                            // fontSize: 18,
                                            fontWeight: 500,
                                            paddingLeft: 4,
                                            paddingRight: 4,
                                        }}
                                    >
                                        1.50 K
                                    </Typography>

                                    <Typography variant="caption">
                                        Docs Written
                                    </Typography>
                                </Box>
                            </Stack>
                        </Stack>
                    </Stack>
                ) : (
                    <Typography>catalog_name</Typography>
                )}
            </Box>
        </Popper>
    );
}

export default NodeTooltip;
