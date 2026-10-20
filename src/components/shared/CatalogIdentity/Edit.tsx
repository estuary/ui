import type { SxProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system/styleFunctionSx';
import type { ReactNode } from 'react';

import { useEffect, useId, useRef, useState } from 'react';

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
    monogram,
    MONOGRAM_TEXT_COLOR,
    monogramColor,
    splitCatalogName,
} from 'src/components/shared/CatalogIdentity/catalogName';
import { LeavesAutocomplete } from 'src/components/shared/LeavesAutocomplete/LeavesAutocomplete';
import { useDebouncedValue } from 'src/hooks/useDebouncedValue';
import {
    appendWithForwardSlash,
    hasLength,
    replaceWhitespacesWithUnderscores,
} from 'src/utils/misc-utils';

// The measurements of the card a catalog entity is presented as: a monogram tile
// over its stable color, with the leaf name above the prefix it lives under.
// Used by the single rendering component behind CatalogIdentityEditor and
// CatalogIdentity, so an entity looks the same before and after it is created.

// How long the monogram takes to cross-fade to a new color.
const MONOGRAM_FADE_MS = 1000;

const TRUNCATE_SX = {
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
} as const;

// Every measurement at scale 1, the size an entity is named at.
const BASE = {
    cardHeight: 72,
    nameFontSize: 18,
    nameLineHeight: 24,
    locationFontSize: 14,
    locationLineHeight: 22,
    monogramFontSize: 20,
    helperFontSize: 12,
};

// How long typing has to pause before the monogram color moves.
const NAME_COLOR_DEBOUNCE_MS = 400;

const NAME_PLACEHOLDER = 'name';
const LOCATION_PLACEHOLDER = 'No home prefix selected';

const HELPER_FADE_MS = 150;

const EDIT_ICON_CLASS = 'catalog-identity-inline-edit';

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

interface CatalogIdentityEditorProps {
    /** The account's leaf name, without its prefix. */
    name: string;
    onNameChange: (name: string) => void;
    /** The catalog prefix the account lives under, trailing slash included. */
    location: string;
    onLocationChange: (location: string) => void;
    /**
     * Shown in place of the name while the location is being edited. It takes
     * the name's line, so keep it to one line's worth of text.
     */
    locationHelperText?: string;
    /** Prefixes offered while editing the location. */
    leaves: string[];
    /** Draws a new name for the account. */
    onRegenerate: () => void;
}

export interface CatalogIdentityDisplayProps {
    catalogName: string;
    scale?: number;
    sx?: SxProps<Theme>;
}

type CatalogIdentityContentProps =
    | ({ mode: 'edit' } & CatalogIdentityEditorProps)
    | ({ mode: 'display' } & CatalogIdentityDisplayProps);

export function CatalogIdentityEditor(props: CatalogIdentityEditorProps) {
    return <CatalogIdentityContent mode="edit" {...props} />;
}

// Both public interfaces use this component; display mode renders static text.
export function CatalogIdentityContent(props: CatalogIdentityContentProps) {
    const { mode } = props;
    const editProps = mode === 'edit' ? props : undefined;
    const displayProps = mode === 'display' ? props : undefined;
    const { prefix, leaf } = splitCatalogName(displayProps?.catalogName ?? '');
    const name = editProps?.name ?? leaf;
    const location = editProps?.location ?? prefix;
    const scale = displayProps?.scale ?? 1;
    const sx = displayProps?.sx;
    // Round scaled measurements to whole pixels to keep text aligned when
    // switching between static text and inputs.
    const px = (value: number) => Math.round(value * scale);

    const cardHeight = px(BASE.cardHeight);
    const nameLineHeight = px(BASE.nameLineHeight);
    const locationLineHeight = px(BASE.locationLineHeight);

    const nameTextSx = {
        fontFamily: 'monospace',
        fontWeight: 600,
        fontSize: px(BASE.nameFontSize),
        lineHeight: `${nameLineHeight}px`,
    } as const;

    const locationTextSx = {
        fontFamily: 'monospace',
        fontSize: px(BASE.locationFontSize),
        lineHeight: `${locationLineHeight}px`,
    } as const;

    // A field's helper text stands in for the line it is not on while that field
    // is being edited, so it takes that line's box and the card keeps its
    // height. It reads as prose about the field rather than as a catalog value,
    // so it drops the monospace face.
    const helperTextSx = {
        fontFamily: 'inherit',
        fontSize: px(BASE.helperFontSize),
    } as const;

    const nameHelperSx = {
        ...helperTextSx,
        lineHeight: `${nameLineHeight}px`,
    } as const;

    const locationHelperSx = {
        ...helperTextSx,
        lineHeight: `${locationLineHeight}px`,
    } as const;

    const cardSx: SystemStyleObject<Theme> = {
        alignItems: 'center',
        height: cardHeight,
        overflow: 'hidden',
    };

    // Stretched to the monogram so the name's line box starts at its top edge
    // and the location ends at its bottom, rather than the pair floating
    // centered against it.
    const columnSx: SystemStyleObject<Theme> = {
        minWidth: 0,
        flex: 1,
        py: 0.25,
        alignSelf: 'stretch',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
    };

    // Squared off the card height, so the two track together.
    const monogramSx: SystemStyleObject<Theme> = {
        height: '100%',
        aspectRatio: '1 / 1',
        flex: 'none',
        borderRadius: (theme) => theme.radius.md,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: px(BASE.monogramFontSize),
        fontWeight: 700,
        color: MONOGRAM_TEXT_COLOR,
        // Carried in both states so the tile keeps its footprint, and so an
        // unnamed account can fade in and out rather than snap.
        border: '1px dashed transparent',
        transition: `background ${MONOGRAM_FADE_MS}ms ease, border-color ${MONOGRAM_FADE_MS}ms ease, color ${MONOGRAM_FADE_MS}ms ease`,
    };

    const locationIconSize = px(BASE.locationFontSize);

    // The catalog name the two lines add up to, and what the tile's color is
    // hashed from. An unnamed entity stands in its placeholder, so the card
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
    const showLocationHelper = Boolean(editProps) && editingLocation;
    const showNameHelper = Boolean(editProps) && editingName;

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
    // character.
    //
    // The debounce lives in this component, so it has to unmount when the
    // surface holding it closes. Held somewhere longer-lived, the next time the
    // surface opened the tile would start on the last session's color and fade
    // off it.
    //
    // `catalogName` substitutes a placeholder leaf for an unnamed entity.
    // Hashing that placeholder would assign a color the entity will never
    // wear, so the unnamed case is carried through as an empty string.
    const settledIdentity = useDebouncedValue(
        hasLength(name) ? catalogName : '',
        NAME_COLOR_DEBOUNCE_MS
    );

    // The tile's color and its painted/unpainted state both come off the
    // settled value. Reading the state from the live name instead would paint
    // the tile a keystroke before its color resolved, and the fade would pass
    // through whatever color the stale value still held.
    const colorIdentity = displayProps?.catalogName ?? settledIdentity;
    const painted = hasLength(colorIdentity);

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
                        ? monogramColor(colorIdentity)
                        : 'transparent',
                    borderColor: painted ? 'transparent' : 'text.disabled',
                    color: painted ? MONOGRAM_TEXT_COLOR : 'text.secondary',
                }}
            >
                {hasLength(name) ? monogram(name) : null}
            </Box>
            <Box sx={columnSx}>
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                >
                    <SwapLine
                        helperText={editProps?.locationHelperText}
                        helperVisible={showLocationHelper}
                        helperSx={nameHelperSx}
                        sx={{ flex: 1, minWidth: 0 }}
                    >
                        <Box
                            sx={{
                                ...nameTextSx,
                                display: 'flex',
                                minWidth: 0,
                                flex: 1,
                                color: 'text.primary',
                            }}
                        >
                            {editProps && editingName ? (
                                <InputBase
                                    value={name}
                                    onChange={(event) =>
                                        editProps?.onNameChange(
                                            replaceWhitespacesWithUnderscores(
                                                event.target.value
                                            ).replace(/[^a-z0-9._-]/gi, '')
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
                                            editProps?.onNameChange(
                                                nameBeforeEdit
                                            );
                                            setEditingName(false);
                                        }
                                    }}
                                    placeholder={
                                        editProps ? NAME_PLACEHOLDER : ''
                                    }
                                    inputRef={nameInputRef}
                                    inputProps={{
                                        'aria-label': 'Name',
                                        'aria-describedby': showNameHelper
                                            ? nameHelperId
                                            : undefined,
                                        // A bare "name" field reads as a login form
                                        // to password managers. Each manager has
                                        // its own opt-out attribute; the browser
                                        // follows autoComplete.
                                        'data-1p-ignore': true,
                                        'data-lpignore': 'true',
                                        'data-bwignore': true,
                                        'data-form-type': 'other',
                                        'autoComplete': 'off',
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
                                    placeholder={
                                        editProps ? NAME_PLACEHOLDER : ''
                                    }
                                    label="name"
                                    textSx={nameSx}
                                    onEdit={
                                        editProps
                                            ? () => {
                                                  setNameBeforeEdit(name);
                                                  setEditingName(true);
                                              }
                                            : undefined
                                    }
                                />
                            )}
                        </Box>
                    </SwapLine>
                    {editProps && editingName ? (
                        <Tooltip title="Randomize name">
                            <IconButton
                                size="small"
                                onClick={editProps?.onRegenerate}
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
                    helperVisible={showNameHelper}
                    helperId={nameHelperId}
                    helperSx={locationHelperSx}
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
                        <Box
                            sx={{
                                ...locationTextSx,
                                display: 'flex',
                                minWidth: 0,
                                flex: 1,
                                color: 'text.secondary',
                            }}
                        >
                            {editProps && editingLocation ? (
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
                                            editProps?.onLocationChange(
                                                locationBeforeEdit
                                            );
                                            setEditingLocation(false);
                                        }
                                    }}
                                >
                                    <LeavesAutocomplete
                                        leaves={editProps?.leaves ?? []}
                                        value={location}
                                        onChange={(value) =>
                                            editProps?.onLocationChange(value)
                                        }
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
                                    placeholder={
                                        editProps ? LOCATION_PLACEHOLDER : ''
                                    }
                                    label="catalog location"
                                    textSx={locationSx}
                                    onEdit={
                                        editProps
                                            ? () => {
                                                  setLocationBeforeEdit(
                                                      location
                                                  );
                                                  setEditingLocation(true);
                                              }
                                            : undefined
                                    }
                                />
                            )}
                        </Box>
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
    onEdit?: () => void;
}

// One of the card's two lines at rest: the value as a button, carrying the
// pencil that appears on hover.
function FieldText({
    value,
    placeholder,
    label,
    textSx,
    onEdit,
}: FieldTextProps) {
    const filled = hasLength(value);

    if (!onEdit) {
        return (
            <Box component="span" sx={{ ...textSx, ...TRUNCATE_SX }}>
                {value}
            </Box>
        );
    }

    return (
        <ButtonBase
            onClick={onEdit}
            disableRipple
            aria-label={`Edit ${label}, currently ${filled ? value : 'unset'}`}
            sx={[EDITABLE_TEXT_SX, textSx]}
        >
            <Box
                component="span"
                sx={{
                    ...TRUNCATE_SX,
                    color: filled ? 'inherit' : 'text.disabled',
                }}
            >
                {filled ? value : placeholder}
            </Box>

            <EditPencil width={14} height={14} className={EDIT_ICON_CLASS} />
        </ButtonBase>
    );
}
