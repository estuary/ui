import type { DateTime } from 'luxon';
import type {
    PeriodSelection,
    UsagePeriod,
} from 'src/components/admin/Billing/usage/period';

import { useState } from 'react';

import {
    Divider,
    InputAdornment,
    List,
    ListItemButton,
    ListItemText,
    Popover,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';

import { Calendar, NavArrowDown } from 'iconoir-react';

import {
    captionSx,
    numericSx,
} from 'src/components/admin/Billing/shared/CardHeader';
import {
    countDays,
    firstUsageDay,
    formatRange,
    periodLabel,
    presetRange,
    PRESETS,
    selectRange,
} from 'src/components/admin/Billing/usage/period';
import { PeriodCalendar } from 'src/components/admin/Billing/usage/PeriodCalendar';
import { paperBackground, paperBackgroundImage } from 'src/context/Theme';

const OPEN_KEYS = ['Enter', ' ', 'ArrowDown'];

interface Props {
    onChange: (selection: PeriodSelection) => void;
    period: UsagePeriod;
    today: DateTime;
}

// Presets beside a calendar; two clicks on the calendar pick a custom range.
export function PeriodControl({ onChange, period, today }: Props) {
    const theme = useTheme();
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    // A custom range being picked: null until its first day is.
    const [draft, setDraft] = useState<{ from: DateTime | null } | null>(null);

    const firstDay = firstUsageDay(today);

    const close = () => {
        setAnchor(null);
        setDraft(null);
    };

    const choose = (selection: PeriodSelection) => {
        onChange(selection);
        close();
    };

    const pick = (day: DateTime) => {
        if (draft?.from && day >= draft.from) {
            choose(selectRange(draft.from, day, today));
        } else {
            setDraft({ from: day });
        }
    };

    let hint = `${countDays(period.from, period.to)} ${
        +period.from === +period.to ? 'day' : 'days'
    } · usage from ${formatRange(firstDay, firstDay)}`;
    if (draft) {
        hint = draft.from
            ? 'Now pick an end date. Over 92 days, whole months are shown.'
            : 'Pick a start date';
    }

    return (
        <>
            <TextField
                label="Period"
                onClick={(event) => setAnchor(event.currentTarget)}
                onKeyDown={(event) => {
                    if (OPEN_KEYS.includes(event.key)) {
                        event.preventDefault();
                        setAnchor(event.currentTarget);
                    }
                }}
                size="small"
                slotProps={{
                    input: {
                        readOnly: true,
                        startAdornment: (
                            <InputAdornment position="start">
                                <Calendar height={16} width={16} />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <NavArrowDown height={16} width={16} />
                            </InputAdornment>
                        ),
                    },
                    htmlInput: {
                        'aria-expanded': Boolean(anchor),
                        'aria-haspopup': 'dialog',
                        'sx': { cursor: 'pointer', textOverflow: 'ellipsis' },
                    },
                }}
                sx={{ width: { xs: '100%', sm: 420 } }}
                variant="outlined"
                value={`${periodLabel(period)} · ${formatRange(period.from, period.to)}`}
            />

            <Popover
                anchorEl={anchor}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                onClose={close}
                open={Boolean(anchor)}
                slotProps={{
                    paper: {
                        'aria-label': 'Choose a period',
                        'role': 'dialog',
                        'sx': {
                            mt: 0.5,
                            bgcolor: paperBackground[theme.palette.mode],
                            backgroundImage:
                                paperBackgroundImage[theme.palette.mode],
                        },
                    },
                }}
            >
                <Stack direction={{ xs: 'column', sm: 'row' }}>
                    <List
                        aria-label="Presets"
                        sx={{ width: { sm: 360 }, py: 1 }}
                    >
                        {PRESETS.map(({ key, label }) => {
                            const range = presetRange(key, today);
                            const chosen =
                                draft === null && period.preset === key;

                            return (
                                <ListItemButton
                                    key={key}
                                    onClick={() => choose({ preset: key })}
                                    selected={chosen}
                                >
                                    <ListItemText primary={label} />

                                    <Typography
                                        component="span"
                                        sx={{ ...captionSx, ...numericSx }}
                                    >
                                        {formatRange(range.from, range.to)}
                                    </Typography>
                                </ListItemButton>
                            );
                        })}

                        <ListItemButton
                            onClick={() => setDraft({ from: null })}
                            selected={
                                Boolean(draft) || period.preset === 'custom'
                            }
                        >
                            <ListItemText primary="Custom range" />

                            {period.preset === 'custom' ? (
                                <Typography
                                    component="span"
                                    sx={{ ...captionSx, ...numericSx }}
                                >
                                    {formatRange(period.from, period.to)}
                                </Typography>
                            ) : null}
                        </ListItemButton>
                    </List>

                    <Divider flexItem orientation="vertical" />

                    <Stack sx={{ alignItems: 'center', pb: 1.5 }}>
                        <PeriodCalendar
                            firstDay={firstDay}
                            from={draft ? draft.from : period.from}
                            lastDay={today}
                            onPick={pick}
                            to={draft ? null : period.to}
                        />

                        <Typography sx={{ ...captionSx, ...numericSx, px: 2 }}>
                            {hint}
                        </Typography>
                    </Stack>
                </Stack>
            </Popover>
        </>
    );
}
