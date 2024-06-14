import { Box, Popper, Stack, Typography } from '@mui/material';
import { paperBackground } from 'context/Theme';
import { FormatDateOptions, useIntl } from 'react-intl';
import { useScopedSystemGraph } from '../Store/Store';
import EntityIcon from './EntityIcon';
import UsageSection from './Usage';

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

                            <UsageSection />
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
