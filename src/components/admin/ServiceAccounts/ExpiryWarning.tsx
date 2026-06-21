import type { SxProps, Theme, TypographyProps } from '@mui/material';
import type { ServiceAccount } from 'src/gql-types/graphql';

import { Stack, Typography } from '@mui/material';

import { WarningTriangle } from 'iconoir-react';
import { DateTime } from 'luxon';

// A single key's expiry urgency: red/"Key expired" once it lapses, a
// warning countdown within 7 days, otherwise null (nothing to flag).
export function tokenExpiry(expiresAt: string | null | undefined): {
    severity: 'expired' | 'expiring';
    label: string;
} | null {
    if (!expiresAt) {
        return null;
    }

    const expires = DateTime.fromISO(expiresAt);
    const now = DateTime.now();

    if (expires < now) {
        return { severity: 'expired', label: 'Key expired' };
    }

    const dayDiff = Math.floor(
        expires.startOf('day').diff(now.startOf('day'), 'days').days
    );

    if (dayDiff > 7) {
        return null;
    }

    let label: string;
    if (dayDiff <= 0) {
        label = 'Key expires today';
    } else if (dayDiff === 1) {
        label = 'Key expires tomorrow';
    } else {
        label = `Key expires in ${dayDiff} days`;
    }

    return { severity: 'expiring', label };
}

// The soonest-expiring token's `expiresAt` — the account's most urgent
// credential. Null when the account has no tokens.
export function soonestExpiry(tokens: ServiceAccount['tokens']): string | null {
    if (tokens.length === 0) {
        return null;
    }

    return tokens.reduce((earliest, token) =>
        DateTime.fromISO(token.expiresAt) < DateTime.fromISO(earliest.expiresAt)
            ? token
            : earliest
    ).expiresAt;
}

interface ExpiryWarningProps {
    expiresAt: string | null | undefined;
    variant?: TypographyProps['variant'];
    sx?: SxProps<Theme>;
}

// Triangle + colored label shown when a token is expired (red) or expiring
// within 7 days (yellow). Renders nothing otherwise.
export function ExpiryWarning({
    expiresAt,
    variant = 'caption',
    sx,
}: ExpiryWarningProps) {
    const alert = tokenExpiry(expiresAt);

    if (!alert) {
        return null;
    }

    return (
        <Stack
            direction="row"
            spacing={0.5}
            sx={[
                {
                    alignItems: 'center',
                    color:
                        alert.severity === 'expired'
                            ? 'error.main'
                            : 'warning.main',
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            <WarningTriangle width={15} height={15} />
            <Typography
                variant={variant}
                color="inherit"
                sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
            >
                {alert.label}
            </Typography>
        </Stack>
    );
}
