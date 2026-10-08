import type { LogLevelFilter } from 'src/components/tables/Logs/types';

import { useCallback } from 'react';

import { Stack, ToggleButtonGroup, Typography } from '@mui/material';

import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';
import { formatSearchedBackTo } from 'src/components/tables/Logs/shared';
import { useJournalDataLogs_oldestLoadedTs } from 'src/stores/JournalData/Logs/hooks';
import { useJournalDataLogsStore } from 'src/stores/JournalData/Logs/Store';

const OPTIONS: { value: LogLevelFilter; label: string }[] = [
    { value: 'all', label: 'All Levels' },
    { value: 'warn', label: 'Warnings and Errors' },
    { value: 'error', label: 'Errors' },
];

interface Props {
    // Counts exclude the fake rows that load older and newer logs
    loadedCount: number;
    visibleCount: number;
}

export function LevelFilter({ loadedCount, visibleCount }: Props) {
    const levelFilter = useJournalDataLogsStore((state) => state.levelFilter);
    const setLevelFilter = useJournalDataLogsStore(
        (state) => state.setLevelFilter
    );
    const olderFinished = useJournalDataLogsStore(
        (state) => state.olderFinished
    );
    const oldestLoadedTs = useJournalDataLogs_oldestLoadedTs();

    const searchedBackTo = olderFinished
        ? 'searched all logs'
        : oldestLoadedTs
          ? `searched back to ${formatSearchedBackTo(oldestLoadedTs) ?? 'unknown'}`
          : null;

    const handleChange = useCallback(
        (_event: unknown, newValue: LogLevelFilter | null) => {
            // Exclusive groups pass null when the selected button is clicked again
            if (newValue && newValue !== levelFilter) {
                setLevelFilter(newValue);
            }
        },
        [levelFilter, setLevelFilter]
    );

    return (
        <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}
        >
            <ToggleButtonGroup
                aria-label="Filter logs by level"
                color="primary"
                size="small"
                exclusive
                value={levelFilter}
                onChange={handleChange}
            >
                {OPTIONS.map(({ value, label }) => (
                    <OutlinedToggleButton
                        key={value}
                        selected={levelFilter === value}
                        size="small"
                        value={value}
                    >
                        {label}
                    </OutlinedToggleButton>
                ))}
            </ToggleButtonGroup>

            {levelFilter !== 'all' && loadedCount > 0 ? (
                <Typography variant="body2" color="text.secondary">
                    {`Showing ${visibleCount.toLocaleString()} of ${loadedCount.toLocaleString()} loaded lines`}
                    {searchedBackTo ? ` · ${searchedBackTo}` : null}
                </Typography>
            ) : null}
        </Stack>
    );
}
