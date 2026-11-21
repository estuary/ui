import type {
    PriceStep,
    UsageMeter,
} from 'src/components/admin/Billing/overview/priceSteps';

import {
    alpha,
    Box,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';

import {
    captionColor,
    captionSx,
    numericSx,
    ruleSx,
} from 'src/components/admin/Billing/shared/CardHeader';
import { Swatch } from 'src/components/admin/Billing/shared/Swatch';

interface Props {
    name: string;
    color: string;
    amount?: string;
    meter: UsageMeter;
}

// One kind of usage this month: its charges, and where its usage sits among
// the plan's price steps.
export function ThisMonthMeter({ name, color, amount, meter }: Props) {
    const theme = useTheme();
    const { steps, percent, quantity, next } = meter;

    // Passed steps are full, the current one fills as far as usage has gone,
    // and later ones are empty.
    const stepBackground = ({ state, fillPercent }: PriceStep) =>
        state === 'passed'
            ? color
            : state === 'later'
              ? theme.palette.action.disabledBackground
              : `linear-gradient(90deg, ${color} ${fillPercent}%, ${alpha(color, 0.28)} ${fillPercent}%)`;

    return (
        <Stack spacing={1} sx={{ ...ruleSx, py: 1.75 }}>
            <Stack
                direction="row"
                sx={{
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    columnGap: 2,
                }}
            >
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                >
                    <Swatch color={color} />
                    <Typography sx={{ fontWeight: 500 }}>{name}</Typography>
                </Stack>

                <Typography sx={{ fontWeight: 500, ...numericSx }}>
                    {amount}
                </Typography>
            </Stack>

            {percent === undefined ? null : (
                <Box
                    aria-hidden
                    sx={{
                        height: 4,
                        borderRadius: 999,
                        overflow: 'hidden',
                        bgcolor: 'action.disabledBackground',
                    }}
                >
                    <Box
                        sx={{
                            width: `${Math.min(100, percent)}%`,
                            height: '100%',
                            borderRadius: 999,
                            bgcolor: color,
                        }}
                    />
                </Box>
            )}

            {steps.length > 0 ? (
                <Box sx={{ display: 'flex', gap: '3px', pt: 0.5 }}>
                    {steps.map((step) => (
                        <Tooltip
                            key={step.tooltip}
                            title={step.tooltip}
                            placement="top"
                        >
                            <Stack
                                spacing={0.625}
                                sx={{ flex: 1, minWidth: 0 }}
                            >
                                {/* Each step's label and the line below say what its bar shows. */}
                                <Box
                                    aria-hidden
                                    sx={{
                                        height: 30,
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: `${step.heightPercent}%`,
                                            background: stepBackground(step),
                                            borderRadius: '3px 3px 0 0',
                                        }}
                                    />
                                </Box>

                                <Typography
                                    component="span"
                                    noWrap
                                    sx={{
                                        ...numericSx,
                                        fontSize: 11,
                                        fontWeight:
                                            step.state === 'current'
                                                ? 500
                                                : 400,
                                        color:
                                            step.state === 'current'
                                                ? 'text.primary'
                                                : captionColor,
                                    }}
                                >
                                    {step.label}
                                </Typography>
                            </Stack>
                        </Tooltip>
                    ))}
                </Box>
            ) : null}

            <Stack
                direction="row"
                sx={{
                    ...captionSx,
                    ...numericSx,
                    fontSize: 12,
                    justifyContent: 'space-between',
                    columnGap: 2,
                }}
            >
                <span>{quantity}</span>
                <span>{next}</span>
            </Stack>
        </Stack>
    );
}
