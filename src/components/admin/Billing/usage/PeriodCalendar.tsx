import type { SxProps, Theme } from '@mui/material';

import { useTheme } from '@mui/material';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { DateTime } from 'luxon';

// The calendar works in local dates and billing days are UTC. Both only ever
// carry a calendar day, so they convert by year, month and day.
const toLocal = (day: DateTime) => new Date(day.year, day.month - 1, day.day);

const toUtc = (date: Date) =>
    DateTime.utc(date.getFullYear(), date.getMonth() + 1, date.getDate());

interface Props {
    // The range shown, or only its start while a range is being picked.
    from: DateTime | null;
    to: DateTime | null;
    firstDay: DateTime;
    lastDay: DateTime;
    onPick: (day: DateTime) => void;
}

// A month calendar that marks a range: its ends as picked days and the days
// between as one band.
export function PeriodCalendar({ firstDay, from, lastDay, onPick, to }: Props) {
    const theme = useTheme();
    const band = theme.palette.primary.alpha_12;

    const daySx = (date: Date): SxProps<Theme> => {
        const day = toUtc(date);

        if ((from && +day === +from) || (to && +day === +to)) {
            return {
                'bgcolor': 'primary.main',
                'color': 'primary.contrastText',
                '&:hover, &:focus': { bgcolor: 'primary.main' },
            };
        }

        // The shadows fill the margins between days, so the band runs unbroken.
        return from && to && day > from && day < to
            ? {
                  borderRadius: 0,
                  bgcolor: band,
                  boxShadow: `-2px 0 0 ${band}, 2px 0 0 ${band}`,
              }
            : {};
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateCalendar
                maxDate={toLocal(lastDay)}
                minDate={toLocal(firstDay)}
                onChange={(date: Date | null) => {
                    if (date) {
                        onPick(toUtc(date));
                    }
                }}
                referenceDate={toLocal(to ?? from ?? lastDay)}
                slotProps={{ day: ({ day }) => ({ sx: daySx(day) }) }}
                value={null}
                views={['day']}
            />
        </LocalizationProvider>
    );
}
