import { Box, IconButton, Stack, Typography, useTheme } from '@mui/material';
import { codeBackground } from 'context/Theme';
import { Minus, Plus } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { useScopedSystemGraph } from '../../Store/Store';

interface Props {
    onManualZoom: (
        event: React.SyntheticEvent<Element, Event>,
        value: number
    ) => void;
    disabled?: boolean;
}

function ManualZoom({ onManualZoom, disabled }: Props) {
    const theme = useTheme();

    const maxZoom = useScopedSystemGraph((state) => state.maxZoom);
    const minZoom = useScopedSystemGraph((state) => state.minZoom);
    const zoom = useScopedSystemGraph((state) => state.zoom);

    return (
        <Stack
            direction="row"
            style={{
                width: 225,
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <Typography>
                <FormattedMessage id="details.scopedSystemGraph.toolbar.zoom.manualZoom.label" />
            </Typography>

            <Stack direction="row" spacing={1}>
                <IconButton
                    disabled={disabled ?? zoom <= minZoom}
                    onClick={(event) => onManualZoom(event, zoom - 0.1)}
                    size="small"
                    sx={{
                        'backgroundColor': codeBackground[theme.palette.mode],
                        '& .Mui-disabled': {
                            backgroundColor: 'unset',
                        },
                    }}
                >
                    <Minus style={{ color: theme.palette.text.primary }} />
                </IconButton>

                <Typography
                    component={Box}
                    style={{
                        width: 37,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {`${(zoom * 100).toFixed(0.1)}%`}
                </Typography>

                <IconButton
                    disabled={disabled ?? zoom >= maxZoom}
                    onClick={(event) => onManualZoom(event, zoom + 0.1)}
                    size="small"
                    style={{
                        backgroundColor: codeBackground[theme.palette.mode],
                    }}
                >
                    <Plus style={{ color: theme.palette.text.primary }} />
                </IconButton>
            </Stack>
        </Stack>
    );
}

export default ManualZoom;
