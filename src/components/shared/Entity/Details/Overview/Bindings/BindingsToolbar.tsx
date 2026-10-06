import type { ChangeEvent } from 'react';
import type {
    BindingCounts,
    BindingsFilterState,
    BindingStatus,
} from 'src/components/shared/Entity/Details/Overview/Bindings/types';

import { useEffect, useMemo, useRef, useState } from 'react';

import {
    Chip,
    IconButton,
    InputAdornment,
    inputBaseClasses,
    outlinedInputClasses,
    Stack,
    TextField,
    useTheme,
} from '@mui/material';

import { Search, Xmark } from 'iconoir-react';
import { debounce } from 'lodash';
import { useUnmount } from 'react-use';

import { diminishedTextColor } from 'src/context/Theme';
import { QUICK_DEBOUNCE_WAIT } from 'src/utils/workflow-utils';

type FilterValue = BindingStatus | 'all';

// RGB translations of #0B131E and #F7F9FC. Quieter than the app-wide
// `defaultOutlineColor_hovered` (0.6), which flashes hard against this field's
// 0.23 resting border.
const searchOutlineColor_hovered = {
    light: `rgba(11, 19, 30, 0.35)`,
    dark: `rgba(247, 249, 252, 0.35)`,
};

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
    const theme = useTheme();
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
            <TextField
                defaultValue={filter.query}
                id="bindings-table-search"
                inputRef={inputRef}
                label={searchLabel}
                onChange={handleChange}
                size="small"
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search
                                    height={16}
                                    width={16}
                                    style={{
                                        color: diminishedTextColor[
                                            theme.palette.mode
                                        ],
                                    }}
                                />
                            </InputAdornment>
                        ),
                        // Replaces the native clear button `type="search"`
                        // would draw in OS styling rather than this app's.
                        endAdornment: hasQuery ? (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="Clear search"
                                    edge="end"
                                    onClick={handleClear}
                                    size="small"
                                >
                                    <Xmark height={14} width={14} />
                                </IconButton>
                            </InputAdornment>
                        ) : undefined,
                    },
                }}
                sx={{
                    flexGrow: 1,
                    minWidth: 220,
                    [`& .${inputBaseClasses.root}`]: { borderRadius: 3 },
                    // Excluding the focused state leaves the primary focus ring
                    // to win once the field is actually active.
                    [`& .${outlinedInputClasses.root}:not(.${outlinedInputClasses.focused}):hover .${outlinedInputClasses.notchedOutline}`]:
                        {
                            borderColor:
                                searchOutlineColor_hovered[theme.palette.mode],
                        },
                }}
                type="text"
                variant="outlined"
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
