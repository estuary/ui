import { Skeleton, Stack, Tooltip, Typography, useTheme } from '@mui/material';

import { getWarningPillSx } from 'src/components/shared/Entity/Details/Overview/shared';
import { diminishedTextColor } from 'src/context/Theme';

interface Props {
    loading?: boolean;
    // Shown in the strip beside the value, e.g. a sync schedule that explains a
    // steady lag. Kept short: the strip is only as tall as its tallest cell.
    note?: string;
    tooltip?: string;
    unit: string;
    value: string;
}

function HeroValue({ loading, note, tooltip, unit, value }: Props) {
    const theme = useTheme();

    if (loading) {
        return <Skeleton height={32} width={110} />;
    }

    const content = (
        <Stack
            direction="row"
            sx={{ alignItems: 'baseline', columnGap: 0.75, flexWrap: 'wrap' }}
        >
            <Typography
                component="div"
                sx={{
                    fontSize: 27,
                    fontWeight: 600,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.05,
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                {value}
            </Typography>

            <Typography
                component="div"
                sx={{
                    color: diminishedTextColor[theme.palette.mode],
                    fontSize: 13,
                    fontWeight: 500,
                }}
            >
                {unit}
            </Typography>

            {note ? (
                <Typography
                    component="div"
                    sx={(t) => ({ ...getWarningPillSx(t), fontSize: 13 })}
                >
                    {note}
                </Typography>
            ) : null}
        </Stack>
    );

    return tooltip ? (
        <Tooltip placement="bottom-start" title={tooltip}>
            <span>{content}</span>
        </Tooltip>
    ) : (
        content
    );
}

export default HeroValue;
