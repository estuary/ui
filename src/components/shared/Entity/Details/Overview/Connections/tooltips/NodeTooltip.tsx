import { Box, Divider, Popper, Stack, Typography } from '@mui/material';
import { paperBackground } from 'context/Theme';
import { FormatDateOptions, useIntl } from 'react-intl';
import { useScopedSystemGraph } from '../Store/Store';
import EntityIcon from './EntityIcon';
import Statistic from './Statistic';

interface Props {
    anchorEl: HTMLElement | null;
}

const TIME_SETTINGS: FormatDateOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
};

function NodeTooltip({ anchorEl }: Props) {
    const intl = useIntl();

    const currentNode = useScopedSystemGraph((state) => state.currentNode);

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
                        <Box style={{ marginTop: 6 }}>
                            <EntityIcon />
                        </Box>

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
                                <Statistic label="Data Read" value="23 GB" />

                                <Divider orientation="vertical" />

                                <Statistic label="Data Written" value="16 GB" />

                                <Divider orientation="vertical" />

                                <Statistic label="Docs Read" value="2.31 K" />

                                <Divider orientation="vertical" />

                                <Statistic
                                    label="Docs Written"
                                    value="1.50 K"
                                />
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
