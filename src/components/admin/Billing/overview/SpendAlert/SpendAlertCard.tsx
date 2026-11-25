import type { useSpendAlert } from 'src/hooks/billing/useSpendAlert';

import { useState } from 'react';

import {
    Box,
    Button,
    Link,
    Skeleton,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import { Link as RouterLink } from 'react-router-dom';

import { authenticatedRoutes } from 'src/app/routes';
import { getSpendAlertView } from 'src/components/admin/Billing/overview/SpendAlert/shared';
import { SpendAlertDialog } from 'src/components/admin/Billing/overview/SpendAlert/SpendAlertDialog';
import { BillingCard } from 'src/components/admin/Billing/shared/BillingCard';
import {
    captionSx,
    cardTitleSx,
    numericSx,
} from 'src/components/admin/Billing/shared/CardHeader';
import AlertBox from 'src/components/shared/AlertBox';
import { StatusPill } from 'src/components/shared/StatusPill';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { getPathWithParams } from 'src/utils/misc-utils';

interface Props {
    tenant: string;
    canEdit: boolean;
    spendAlert: ReturnType<typeof useSpendAlert>;
    // This month's charges so far, or null while they load or if unavailable.
    chargesCents: number | null;
}

export function SpendAlertCard({
    tenant,
    canEdit,
    spendAlert,
    chargesCents,
}: Props) {
    const theme = useTheme();
    const [editing, setEditing] = useState(false);

    const view = getSpendAlertView({ ...spendAlert, chargesCents, canEdit });
    const ready = !spendAlert.loading && !spendAlert.error;

    return (
        <BillingCard label="Spend alert">
            <Stack spacing={1.5} sx={{ px: 3, py: 2 }}>
                <Stack
                    direction="row"
                    sx={{
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        columnGap: 3,
                        rowGap: 1.5,
                    }}
                >
                    <Stack
                        spacing={0.25}
                        sx={{ flex: '1 1 260px', minWidth: 0 }}
                    >
                        <Stack
                            direction="row"
                            spacing={1.25}
                            sx={{ alignItems: 'center' }}
                        >
                            <Typography component="h2" sx={cardTitleSx}>
                                Spend alert
                            </Typography>

                            {ready ? (
                                <StatusPill
                                    variant={view.status}
                                    label={view.statusLabel}
                                />
                            ) : null}
                        </Stack>

                        {spendAlert.loading ? (
                            <Skeleton sx={{ maxWidth: 360 }} />
                        ) : null}

                        {ready ? (
                            <Typography sx={{ ...captionSx, ...numericSx }}>
                                {view.line}
                            </Typography>
                        ) : null}
                    </Stack>

                    {ready ? (
                        <>
                            {view.meter ? (
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    sx={{ alignItems: 'center' }}
                                >
                                    <Typography
                                        sx={{
                                            ...captionSx,
                                            ...numericSx,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {view.meter.text}
                                    </Typography>

                                    <Box
                                        aria-hidden
                                        sx={{
                                            width: 140,
                                            height: 6,
                                            borderRadius: 999,
                                            overflow: 'hidden',
                                            backgroundColor:
                                                theme.palette.divider,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: `${view.meter.percent}%`,
                                                height: '100%',
                                                borderRadius: 999,
                                                backgroundColor: view.meter
                                                    .reached
                                                    ? theme.palette.warning.main
                                                    : theme.palette.primary
                                                          .main,
                                            }}
                                        />
                                    </Box>
                                </Stack>
                            ) : null}

                            {view.action ? (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setEditing(true)}
                                >
                                    {view.action}
                                </Button>
                            ) : (
                                <Typography sx={captionSx}>
                                    Admins only
                                </Typography>
                            )}
                        </>
                    ) : null}
                </Stack>

                {spendAlert.error ? (
                    <AlertBox short severity="error">
                        There was an error loading your spend alert. Please try
                        again later.
                    </AlertBox>
                ) : null}

                {view.noRecipients ? (
                    <AlertBox short severity="warning">
                        No one gets {tenant} spend alerts yet, so this
                        won&apos;t email anyone. Add recipients in{' '}
                        <Link
                            component={RouterLink}
                            to={getPathWithParams(
                                authenticatedRoutes.admin.settings.fullPath,
                                { [GlobalSearchParams.PREFIX]: tenant }
                            )}
                        >
                            Settings
                        </Link>
                        .
                    </AlertBox>
                ) : null}

                {canEdit ? (
                    <SpendAlertDialog
                        open={editing}
                        tenant={tenant}
                        amountCents={spendAlert.amountCents}
                        enabled={spendAlert.enabled}
                        chargesCents={chargesCents}
                        hasRecipients={spendAlert.hasRecipients}
                        onClose={() => setEditing(false)}
                        save={spendAlert.save}
                        disable={spendAlert.disable}
                    />
                ) : null}
            </Stack>
        </BillingCard>
    );
}
