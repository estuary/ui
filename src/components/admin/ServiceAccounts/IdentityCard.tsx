import type { SxProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system/styleFunctionSx';
import type { ReactNode } from 'react';

import { useEffect, useId, useMemo, useRef, useState } from 'react';

import {
    autocompleteClasses,
    Box,
    ButtonBase,
    Fade,
    formHelperTextClasses,
    IconButton,
    InputBase,
    inputBaseClasses,
    inputClasses,
    inputLabelClasses,
    Stack,
    Tooltip,
} from '@mui/material';

import { EditPencil, Home, Refresh } from 'iconoir-react';

import {
    identityLayout,
    TRUNCATE_SX,
} from 'src/components/admin/ServiceAccounts/identityLayout';
import {
    monogram,
    MONOGRAM_TEXT_COLOR,
    monogramColor,
} from 'src/components/admin/ServiceAccounts/shared';
import { LeavesAutocomplete } from 'src/components/shared/LeavesAutocomplete/LeavesAutocomplete';
import { useDebouncedValue } from 'src/hooks/useDebouncedValue';
import { appendWithForwardSlash, hasLength } from 'src/utils/misc-utils';

// How long typing has to pause before the monogram color moves.
const NAME_COLOR_DEBOUNCE_MS = 400;

// How long a line takes to cross over between its value and a helper text.
const HELPER_FADE_MS = 150;

const NAME_PLACEHOLDER = 'service-account';
const LOCATION_PLACEHOLDER = 'No home prefix selected';

const EDIT_ICON_CLASS = 'service-account-inline-edit';

// A field at rest while it can still be changed: plain text, with a pencil that
// keeps its place in the layout at all times and only fades in on hover, so
// revealing it does not shift the text beside it.
const EDITABLE_TEXT_SX: SystemStyleObject<Theme> = {
    minWidth: 0,
    gap: 0.75,
    justifyContent: 'flex-start',
    cursor: 'pointer',
    [`& .${EDIT_ICON_CLASS}`]: {
        flex: 'none',
        // Muted against the text it sits beside, so it reads as an affordance
        // rather than part of the value.
        color: 'text.secondary',
        opacity: 0,
        transition: 'opacity 150ms ease',
    },
    [`&:hover .${EDIT_ICON_CLASS}, &:focus-visible .${EDIT_ICON_CLASS}`]: {
        opacity: 0.7,
    },
};

// The fields sit directly on the card surface, with no border of their own, so
// the block reads as the account's card rather than as a form.
const INLINE_INPUT_SX: SystemStyleObject<Theme> = {
    'borderRadius': (theme) => theme.radius.sm,
    '&:hover': { borderColor: 'text.disabled' },
    '&:focus-within': { borderColor: 'primary.main' },
};

// The shared autocomplete ships a floating label and a two-line helper-text
// reservation. Neither fits on a single row, so the label is hidden from sight
// but left for screen readers, and the underline and helper slot are collapsed.
const INLINE_AUTOCOMPLETE_SX: SystemStyleObject<Theme> = {
    // The standard variant reserves 16px above itself for a floating label that
    // is hidden here. Left in, it pushes the column past the card's padding. Its
    // 1px of bottom padding, meant to sit above the underline, goes with it —
    // there is no underline, and it lifts the text off the read-mode baseline.
    [`&&& .${inputBaseClasses.formControl}`]: { mt: 0, pb: 0 },
    [`& .${inputLabelClasses.root}`]: {
        position: 'absolute',
        width: 1,
        height: 1,
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        whiteSpace: 'nowrap',
    },
    [`& .${formHelperTextClasses.root}`]: { display: 'none' },
    [`& .${inputClasses.underline}:before, & .${inputClasses.underline}:after`]:
        { display: 'none' },
};

interface IdentityCardProps {
    /** The account's leaf name, without its prefix. */
    name: string;
    /** The catalog prefix the account lives under, trailing slash included. */
    location: string;
    /** Omit to render the name as plain text, with no edit affordance. */
    onNameChange?: (name: string) => void;
    /** Omit to render the location as plain text, with no edit affordance. */
    onLocationChange?: (location: string) => void;
    /**
     * Shown in place of the location while the name is being edited. It takes
     * the location's line, so keep it to one line's worth of text.
     */
    nameHelperText?: string;
    /**
     * Shown in place of the name while the location is being edited. It takes
     * the name's line, so keep it to one line's worth of text.
     */
    locationHelperText?: string;
    /** Prefixes offered while editing the location. */
    leaves?: string[];
    /** Omit to leave the randomize button off the name row. */
    onRegenerate?: () => void;
    /** Multiplies every measurement. 1 is the create dialog's size. */
    scale?: number;
    sx?: SxProps<Theme>;
}

/**
 * How a service account is presented: a monogram tile over its stable color,
 * with the leaf name above the catalog location it lives under.
 *
 * Each line is editable in place when given a change handler, and plain text
 * without one — so the create dialog's card and the details page's card are the
 * same card, and an account being created looks like the one it is about to
 * become.
 */
export function IdentityCard({
    name,
    location,
    onNameChange,
    onLocationChange,
    nameHelperText,
    locationHelperText,
    leaves,
    onRegenerate,
    scale = 1,
    sx,
}: IdentityCardProps) {
    const {
        cardSx,
        columnSx,
        monogramSx,
        nameTextSx,
        nameLineHeight,
        locationTextSx,
        nameHelperSx,
        locationHelperSx,
        locationIconSize,
    } = useMemo(() => identityLayout(scale), [scale]);

    // The catalog name the two lines add up to, and what the tile's color is
    // hashed from. An unnamed account stands in its placeholder, so the card
    // always has something to hash.
    //
    // A prefix picks up its trailing slash when the edit is committed, so the
    // slash is added here too. Without it the name the color comes from changes
    // on the way out of the edit, and the tile would settle on one color while
    // typing and then move to another.
    const catalogName = `${appendWithForwardSlash(location)}${
        hasLength(name) ? name : NAME_PLACEHOLDER
    }`;

    const [editingName, setEditingName] = useState(false);
    const [editingLocation, setEditingLocation] = useState(false);

    // Held so Escape can put the value back. Without it Escape would reach the
    // surrounding dialog and close the whole thing mid-edit.
    const [nameBeforeEdit, setNameBeforeEdit] = useState(name);
    const [locationBeforeEdit, setLocationBeforeEdit] = useState(location);

    const nameInputRef = useRef<HTMLInputElement>(null);

    // Each field's helper text takes the other field's line while that field is
    // being edited. The card keeps its height, the value being typed keeps its
    // place, and the help sits on the line the reader is not using.
    // Each helper is mounted for as long as its field is editable, so it has
    // something to fade out to when the edit ends.
    const showLocationHelper = editingLocation;
    const showNameHelper = editingName;

    // The name's helper renders on the location's line, away from the input it
    // belongs to, so the input points at it.
    const generatedId = useId();
    const nameHelperId = `${generatedId}-name-helper`;

    // Focus lands here rather than on `autoFocus` so the caret can be placed
    // deliberately: at the end of the name, ready to be extended. The effect is
    // keyed on the mode alone, so typing never moves the caret back.
    useEffect(() => {
        const node = nameInputRef.current;

        if (!editingName || !node) {
            return;
        }

        node.focus();
        node.setSelectionRange(node.value.length, node.value.length);
    }, [editingName]);

    // The tile color is derived per keystroke, so it settles once typing pauses
    // and crossfades to its new value instead of strobing through a hue per
    // character. A read-only card seeds the settled value on mount, so it paints
    // its color straight away.
    //
    // The debounce lives in this component, so it has to unmount when the
    // surface holding it closes. Held somewhere longer-lived, the next time the
    // surface opened the tile would start on the last session's color and fade
    // off it.
    //
    // `namePreview` substitutes a placeholder leaf for an unnamed account.
    // Hashing that placeholder would assign a color the account will never
    // wear, so the unnamed case is carried through as an empty string.
    const settledIdentity = useDebouncedValue(
        hasLength(name) ? catalogName : '',
        NAME_COLOR_DEBOUNCE_MS
    );

    // The tile's color and its painted/unpainted state both come off the
    // settled value. Reading the state from the live name instead would paint
    // the tile a keystroke before its color resolved, and the fade would pass
    // through whatever color the stale value still held.
    const painted = hasLength(settledIdentity);

    const nameSx = {
        ...nameTextSx,
        // Fills the row beside the randomize button.
        flex: 1,
        color: 'text.primary',
    };

    const locationSx = {
        ...locationTextSx,
        // Fills the row beside the home icon, so the whole line is a click
        // target for the edit it opens.
        flex: 1,
        minWidth: 0,
        color: 'text.secondary',
    };

    return (
        <Stack
            direction="row"
            spacing={1.5}
            sx={[cardSx, ...(Array.isArray(sx) ? sx : [sx ?? {}])]}
        >
            <Box
                sx={{
                    ...monogramSx,
                    background: painted
                        ? monogramColor(settledIdentity)
                        : 'transparent',
                    borderColor: painted ? 'transparent' : 'text.disabled',
                    color: painted ? MONOGRAM_TEXT_COLOR : 'text.secondary',
                }}
            >
                {/* The letter tracks the live name, so it lands on the
                    keystroke rather than waiting out the debounce. It comes off
                    the name on its own: a prefix mid-edit has no trailing slash
                    yet, and reading the two as one catalog name would take the
                    letter from the half-typed prefix instead. */}
                {hasLength(name) ? monogram(name) : null}
            </Box>

            <Box sx={columnSx}>
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                >
                    <SwapLine
                        helperText={locationHelperText}
                        helperVisible={showLocationHelper}
                        helperSx={nameHelperSx}
                        sx={{ flex: 1, minWidth: 0 }}
                    >
                        {onNameChange && editingName ? (
                            <InputBase
                                value={name}
                                onChange={(event) =>
                                    onNameChange(
                                        event.target.value
                                            .replace(/[^a-z0-9-]/gi, '')
                                            .toLowerCase()
                                    )
                                }
                                onBlur={() => setEditingName(false)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        setEditingName(false);
                                    }

                                    if (event.key === 'Escape') {
                                        // Kept off the dialog, which would take it
                                        // as a request to close.
                                        event.stopPropagation();
                                        onNameChange(nameBeforeEdit);
                                        setEditingName(false);
                                    }
                                }}
                                placeholder={NAME_PLACEHOLDER}
                                inputRef={nameInputRef}
                                inputProps={{
                                    'aria-label': 'Name',
                                    'aria-describedby': showNameHelper
                                        ? nameHelperId
                                        : undefined,
                                }}
                                sx={{
                                    ...INLINE_INPUT_SX,
                                    ...nameSx,
                                    minWidth: 0,
                                    // MUI fixes the input at 1.4375em, which
                                    // overrides the line box and leaves it a pixel
                                    // shorter than the read-only span.
                                    [`& .${inputBaseClasses.input}`]: {
                                        p: 0,
                                        height: 'auto',
                                    },
                                }}
                            />
                        ) : (
                            <FieldText
                                value={name}
                                placeholder={NAME_PLACEHOLDER}
                                label="name"
                                textSx={nameSx}
                                onEdit={
                                    onNameChange
                                        ? () => {
                                              setNameBeforeEdit(name);
                                              setEditingName(true);
                                          }
                                        : undefined
                                }
                            />
                        )}
                    </SwapLine>

                    {onRegenerate && editingName ? (
                        <Tooltip title="Randomize name">
                            <IconButton
                                size="small"
                                onClick={onRegenerate}
                                // Keep focus on the input, so regenerating does
                                // not blur out of edit mode.
                                onMouseDown={(event) => event.preventDefault()}
                                aria-label="Randomize name"
                                // Boxed to the name's line height. Left at its
                                // natural size it is the tallest thing on the
                                // row and pushes the name down off the
                                // monogram's top edge.
                                sx={{
                                    flex: 'none',
                                    p: 0,
                                    width: nameLineHeight,
                                    height: nameLineHeight,
                                }}
                            >
                                <Refresh
                                    width={14}
                                    height={14}
                                    strokeWidth={2}
                                />
                            </IconButton>
                        </Tooltip>
                    ) : null}
                </Stack>

                <SwapLine
                    helperText={nameHelperText}
                    helperVisible={showNameHelper}
                    helperSx={locationHelperSx}
                    helperId={nameHelperId}
                    sx={{ flex: 'none' }}
                >
                    <Stack
                        direction="row"
                        spacing={0.75}
                        sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flex: 'none',
                                color: 'text.secondary',
                            }}
                        >
                            <Home
                                width={locationIconSize}
                                height={locationIconSize}
                            />
                        </Box>

                        {onLocationChange && editingLocation ? (
                            <Box
                                sx={[
                                    INLINE_INPUT_SX,
                                    INLINE_AUTOCOMPLETE_SX,
                                    {
                                        flex: 1,
                                        minWidth: 0,
                                        // The autocomplete's own size-small rule for
                                        // this input carries four classes, so it needs
                                        // to be outranked rather than tied — a tie
                                        // loses on source order, since MUI's styles are
                                        // injected after these.
                                        [`&&& .${autocompleteClasses.inputRoot} .${autocompleteClasses.input}`]:
                                            {
                                                p: 0,
                                                // MUI pins the input at 1.4375em, which
                                                // overrides the line box.
                                                height: 'auto',
                                                ...locationTextSx,
                                                color: 'text.secondary',
                                            },
                                    },
                                ]}
                                // Enter and Tab are the autocomplete's own:
                                // Enter takes the highlighted prefix and
                                // leaves the field, Tab takes it and stays for
                                // the next segment.
                                onKeyDown={(event) => {
                                    if (event.key === 'Escape') {
                                        // Kept off the dialog, which would take it as a
                                        // request to close.
                                        event.stopPropagation();
                                        onLocationChange(locationBeforeEdit);
                                        setEditingLocation(false);
                                    }
                                }}
                            >
                                <LeavesAutocomplete
                                    leaves={leaves ?? []}
                                    value={location}
                                    onChange={onLocationChange}
                                    onBlur={() => setEditingLocation(false)}
                                    label="Catalog location"
                                    textFieldVariant="standard"
                                    autoFocus
                                    required
                                />
                            </Box>
                        ) : (
                            <FieldText
                                value={location}
                                placeholder={LOCATION_PLACEHOLDER}
                                label="catalog location"
                                textSx={locationSx}
                                onEdit={
                                    onLocationChange
                                        ? () => {
                                              setLocationBeforeEdit(location);
                                              setEditingLocation(true);
                                          }
                                        : undefined
                                }
                            />
                        )}
                    </Stack>
                </SwapLine>
            </Box>
        </Stack>
    );
}

interface SwapLineProps {
    /** Faded in over the line's value. Omit to leave the value on its own. */
    helperText?: string;
    helperVisible: boolean;
    helperSx: SystemStyleObject<Theme>;
    /** Set when an input elsewhere on the card describes itself with it. */
    helperId?: string;
    sx: SystemStyleObject<Theme>;
    children: ReactNode;
}

// One line of the card, crossfading between its value and a helper text. The
// value keeps its place in the layout and the helper is laid over it, so the
// card holds its height through the swap. A faded-out layer is hidden outright,
// which keeps its pencil off the tab order and its text out of the reading
// order.
function SwapLine({
    helperText,
    helperVisible,
    helperSx,
    helperId,
    sx,
    children,
}: SwapLineProps) {
    const hasHelper = hasLength(helperText);

    return (
        <Box sx={{ position: 'relative', display: 'flex', minWidth: 0, ...sx }}>
            <Fade
                in={!hasHelper || !helperVisible}
                timeout={HELPER_FADE_MS}
                // The card paints its value straight away; only the swap fades.
                appear={false}
            >
                <Box
                    sx={{
                        'display': 'flex',
                        'flex': 1,
                        'minWidth': 0,
                        '& > *': { flex: 1, minWidth: 0 },
                    }}
                >
                    {children}
                </Box>
            </Fade>

            {hasHelper ? (
                <Fade in={helperVisible} timeout={HELPER_FADE_MS}>
                    <Box
                        id={helperId}
                        sx={{
                            ...helperSx,
                            ...TRUNCATE_SX,
                            position: 'absolute',
                            inset: 0,
                            color: 'text.secondary',
                        }}
                    >
                        {helperText}
                    </Box>
                </Fade>
            ) : null}
        </Box>
    );
}

interface FieldTextProps {
    value: string;
    placeholder: string;
    label: string;
    textSx: SystemStyleObject<Theme>;
    /** Omitted on a read-only card, which drops the pencil and the click. */
    onEdit?: () => void;
}

// One of the card's two lines at rest. With `onEdit` it is a button carrying the
// hover pencil; without, plain text.
function FieldText({
    value,
    placeholder,
    label,
    textSx,
    onEdit,
}: FieldTextProps) {
    const filled = hasLength(value);

    const text = (
        <Box
            component="span"
            sx={{
                ...TRUNCATE_SX,
                color: filled ? 'inherit' : 'text.disabled',
            }}
        >
            {filled ? value : placeholder}
        </Box>
    );

    if (!onEdit) {
        return <Box sx={textSx}>{text}</Box>;
    }

    return (
        <ButtonBase
            onClick={onEdit}
            disableRipple
            aria-label={`Edit ${label}, currently ${filled ? value : 'unset'}`}
            sx={[EDITABLE_TEXT_SX, textSx]}
        >
            {text}
            <EditPencil width={14} height={14} className={EDIT_ICON_CLASS} />
        </ButtonBase>
    );
}
