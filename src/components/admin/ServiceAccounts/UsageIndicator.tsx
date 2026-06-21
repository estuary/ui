import type { SxProps, Theme, TypographyProps } from '@mui/material';

import { Box, Stack, Typography } from '@mui/material';

import { DateTime } from 'luxon';

import { diminishedTextColor } from 'src/context/Theme';

// Maps an account's last authentication to a status tone (for the dot) and a
// label. "recent" (green) is roughly the last month — this calendar week
// through three weeks ago; older is "stale" (yellow); a never-used account is
// "unused" (gray).
function usageStatus(lastUsedAt: string | null | undefined): {
    tone: 'unused' | 'recent' | 'stale';
    label: string;
} {
    if (!lastUsedAt) {
        return { tone: 'unused', label: 'Never used' };
    }

    const used = DateTime.fromISO(lastUsedAt);
    const now = DateTime.now();
    const dayDiff = Math.floor(
        now.startOf('day').diff(used.startOf('day'), 'days').days
    );
    const weekDiff = Math.floor(
        now.startOf('week').diff(used.startOf('week'), 'weeks').weeks
    );

    if (weekDiff <= 3) {
        let label: string;
        if (dayDiff <= 0) {
            label = 'Last used today';
        } else if (dayDiff === 1) {
            label = 'Last used yesterday';
        } else if (weekDiff === 0) {
            label = 'Last used this week';
        } else if (weekDiff === 1) {
            label = 'Last used last week';
        } else {
            label = `Last used ${weekDiff} weeks ago`;
        }

        return { tone: 'recent', label };
    }

    const monthsAgo = Math.max(
        1,
        Math.floor(
            now.startOf('month').diff(used.startOf('month'), 'months').months
        )
    );
    const label =
        monthsAgo >= 12
            ? 'Unused for over a year'
            : `Unused for ${monthsAgo} month${monthsAgo === 1 ? '' : 's'}`;

    return { tone: 'stale', label };
}

interface UsageIndicatorProps {
    lastUsedAt: string | null | undefined;
    variant?: TypographyProps['variant'];
    sx?: SxProps<Theme>;
}

// A colored dot plus a label summarizing when a service account last
// authenticated: gray = never used, green = within roughly the last month,
// yellow = longer ago.
export function UsageIndicator({
    lastUsedAt,
    variant = 'caption',
    sx,
}: UsageIndicatorProps) {
    const usage = usageStatus(lastUsedAt);

    return (
        <Stack
            direction="row"
            spacing={0.75}
            sx={[{ alignItems: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
        >
            <Box
                component="span"
                sx={{
                    width: 7,
                    height: 7,
                    flex: 'none',
                    borderRadius: '50%',
                    backgroundColor: (theme) => {
                        if (usage.tone === 'recent') {
                            return theme.palette.success.main;
                        }
                        if (usage.tone === 'stale') {
                            return theme.palette.warning.main;
                        }
                        return diminishedTextColor[theme.palette.mode];
                    },
                }}
            />
            <Typography variant={variant} color="text.secondary">
                {usage.label}
            </Typography>
        </Stack>
    );
}
