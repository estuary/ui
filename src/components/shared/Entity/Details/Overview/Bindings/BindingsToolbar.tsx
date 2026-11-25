import type { ChangeEvent } from 'react';
import type {
    BindingCounts,
    BindingsFilterState,
    BindingStatus,
} from 'src/components/shared/Entity/Details/Overview/Bindings/types';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Chip, Stack } from '@mui/material';

import { debounce } from 'lodash';
import { useUnmount } from 'react-use';

import { SearchField } from 'src/components/shared/SearchField';
import { QUICK_DEBOUNCE_WAIT } from 'src/utils/workflow-utils';

type FilterValue = BindingStatus | 'all';

const FILTERS: { value: FilterValue; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'enabled', label: 'Enabled' },
    { value: 'disabled', label: 'Disabled' },
];

interface Props {
    counts: BindingCounts;
    // Reported so the chips can show which is active, but never merged into an
    // update — see setFilter below.
    filter: BindingsFilterState;
    searchLabel: string;
    // Takes an updater rather than a value. Search is debounced, so a keystroke
    // can still be in flight when a chip is clicked; spreading a captured
    // `filter` into the update would let the late keystroke clobber the chip.
    setFilter: (
        update: (previous: BindingsFilterState) => BindingsFilterState
    ) => void;
}

export function BindingsToolbar({
    counts,
    filter,
    searchLabel,
    setFilter,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    // The field stays uncontrolled for typing — see the debounce below — so
    // this tracks only whether the clear button should show, not the text
    // itself. Flips on empty/non-empty transitions rather than every
    // keystroke, which is what keeps typing from re-rendering the toolbar.
    const [hasQuery, setHasQuery] = useState(filter.query !== '');

    const onSearchChange = useMemo(
        () =>
            debounce((value: string) => {
                setFilter((previous) => ({ ...previous, query: value }));
            }, QUICK_DEBOUNCE_WAIT),
        [setFilter]
    );

    useUnmount(() => {
        onSearchChange.cancel();
    });

    // An external reset — the empty state's "clear filter" action — sets
    // `filter.query` directly, bypassing the input entirely. Sync the
    // uncontrolled field's own displayed text (and the clear button) to
    // match whenever that happens.
    useEffect(() => {
        if (filter.query === '' && inputRef.current) {
            inputRef.current.value = '';
            setHasQuery(false);
        }
    }, [filter.query]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;

        setHasQuery(value !== '');
        onSearchChange(value);
    };

    const handleClear = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.focus();
        }

        setHasQuery(false);
        onSearchChange.cancel();
        setFilter((previous) => ({ ...previous, query: '' }));
    };

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
            <SearchField
                defaultValue={filter.query}
                id="bindings-table-search"
                inputRef={inputRef}
                label={searchLabel}
                onChange={handleChange}
                onClear={hasQuery ? handleClear : undefined}
                sx={{ flexGrow: 1, minWidth: 220 }}
            />

            {FILTERS.map(({ value, label }) => (
                <Chip
                    key={value}
                    color={filter.status === value ? 'primary' : 'default'}
                    label={`${label}  ${counts[value === 'all' ? 'all' : value]}`}
                    onClick={() => {
                        setFilter((previous) => ({
                            ...previous,
                            status: value,
                        }));
                    }}
                    size="small"
                    sx={{ fontWeight: 500 }}
                    variant={filter.status === value ? 'filled' : 'outlined'}
                />
            ))}
        </Stack>
    );
}
