import type { ChangeEvent } from 'react';
import type {
    BindingCounts,
    BindingsFilterState,
    BindingStatus,
} from 'src/components/shared/Entity/Details/Overview/Bindings/types';

import { useMemo } from 'react';

import { Chip, inputBaseClasses, Stack, TextField } from '@mui/material';

import { debounce } from 'lodash';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';

import { QUICK_DEBOUNCE_WAIT } from 'src/utils/workflow-utils';

type FilterValue = BindingStatus | 'all';

const FILTERS: { value: FilterValue; labelId: string }[] = [
    { value: 'all', labelId: 'detailsPanel.bindings.filter.all' },
    { value: 'enabled', labelId: 'detailsPanel.bindings.status.enabled' },
    { value: 'disabled', labelId: 'detailsPanel.bindings.status.disabled' },
];

interface Props {
    counts: BindingCounts;
    // Reported so the chips can show which is active, but never merged into an
    // update — see setFilter below.
    filter: BindingsFilterState;
    searchLabelId: string;
    // Takes an updater rather than a value. Search is debounced, so a keystroke
    // can still be in flight when a chip is clicked; spreading a captured
    // `filter` into the update would let the late keystroke clobber the chip.
    setFilter: (
        update: (previous: BindingsFilterState) => BindingsFilterState
    ) => void;
}

function BindingsToolbar({ counts, filter, searchLabelId, setFilter }: Props) {
    const intl = useIntl();

    const onSearchChange = useMemo(
        () =>
            debounce((event: ChangeEvent<HTMLInputElement>) => {
                const { value } = event.target;

                setFilter((previous) => ({ ...previous, query: value }));
            }, QUICK_DEBOUNCE_WAIT),
        [setFilter]
    );

    useUnmount(() => {
        onSearchChange.cancel();
    });

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                alignItems: 'center',
                flexWrap: 'wrap',
                rowGap: 1,
            }}
        >
            <TextField
                defaultValue={filter.query}
                id="bindings-table-search"
                label={intl.formatMessage({ id: searchLabelId })}
                onChange={onSearchChange}
                size="small"
                sx={{
                    flexGrow: 1,
                    minWidth: 220,
                    [`& .${inputBaseClasses.root}`]: { borderRadius: 3 },
                }}
                type="search"
                variant="outlined"
            />

            {/* These carry the enabled/disabled counts, which is why the status
                strip does not repeat them: these are interactive. */}
            {FILTERS.map(({ value, labelId }) => (
                <Chip
                    key={value}
                    color={filter.status === value ? 'primary' : 'default'}
                    label={`${intl.formatMessage({ id: labelId })}  ${counts[value === 'all' ? 'all' : value]}`}
                    onClick={() => {
                        setFilter((previous) => ({
                            ...previous,
                            status: value,
                        }));
                    }}
                    variant={filter.status === value ? 'filled' : 'outlined'}
                />
            ))}
        </Stack>
    );
}

export default BindingsToolbar;
