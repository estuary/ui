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
    Stack,
    TextField,
    useTheme,
} from '@mui/material';

import { Search, Xmark } from 'iconoir-react';
import { debounce } from 'lodash';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';

import { diminishedTextColor } from 'src/context/Theme';
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

// Sorting deliberately has no toolbar affordance: BindingsTable's column
// header TableSortLabel already covers it, and a second control here would
// duplicate that capability rather than add one — see round-2 review notes.
function BindingsToolbar({ counts, filter, searchLabelId, setFilter }: Props) {
    const intl = useIntl();
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
                label={intl.formatMessage({ id: searchLabelId })}
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
                        // Replaces the browser's own native clear button —
                        // `type="search"` would otherwise draw one in its own
                        // OS styling, not from this app's icon set — with one
                        // built from the same Xmark glyph every other clear
                        // affordance in the app uses.
                        endAdornment: hasQuery ? (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label={intl.formatMessage({
                                        id: 'detailsPanel.bindings.search.clear',
                                    })}
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
                }}
                type="text"
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
                    size="small"
                    sx={{ fontWeight: 500 }}
                    variant={filter.status === value ? 'filled' : 'outlined'}
                />
            ))}
        </Stack>
    );
}

export default BindingsToolbar;
