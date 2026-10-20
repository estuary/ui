import type { SxProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system/styleFunctionSx';

import { useEffect, useRef, useState } from 'react';

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

import { Monogram } from 'src/components/shared/CatalogIdentity/Monogram';
import { LeavesAutocomplete } from 'src/components/shared/LeavesAutocomplete/LeavesAutocomplete';
import {
    appendWithForwardSlash,
    getAutofillIgnoreProps,
    hasLength,
    replaceWhitespacesWithUnderscores,
    splitCatalogName,
} from 'src/utils/misc-utils';

const TRUNCATE_SX = {
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
} as const;

const BASE = {
    cardHeight: 72,
    nameFontSize: 18,
    nameLineHeight: 24,
    homePrefixFontSize: 14,
    homePrefixLineHeight: 22,
    helperFontSize: 12,
};

const NAME_PLACEHOLDER = 'name';
const HOME_PREFIX_PLACEHOLDER = 'No home prefix selected';

const HELPER_FADE_MS = 150;

const EDIT_ICON_CLASS = 'catalog-identity-inline-edit';

const EDITABLE_TEXT_SX: SystemStyleObject<Theme> = {
    minWidth: 0,
    gap: 0.75,
    justifyContent: 'flex-start',
    cursor: 'pointer',
    [`& .${EDIT_ICON_CLASS}`]: {
        flex: 'none',
        color: 'text.secondary',
        opacity: 0,
        transition: 'opacity 150ms ease',
    },
    [`&:hover .${EDIT_ICON_CLASS}, &:focus-visible .${EDIT_ICON_CLASS}`]: {
        opacity: 0.7,
    },
};

const INLINE_INPUT_SX: SystemStyleObject<Theme> = {
    'borderRadius': (theme) => theme.radius.sm,
    '&:hover': { borderColor: 'text.disabled' },
    '&:focus-within': { borderColor: 'primary.main' },
};

// Custom LeavesAutocomplete styling
const INLINE_AUTOCOMPLETE_SX: SystemStyleObject<Theme> = {
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
    name: string;
    onNameChange: (name: string) => void;
    homePrefix: string;
    onHomePrefixChange: (homePrefix: string) => void;
    homePrefixHelperText?: string;
    leaves: string[];
    /** Draws a new name for the account. */
    onRegenerate?: () => void;
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
    const homePrefix = editProps?.homePrefix ?? prefix;
    const scale = displayProps?.scale ?? 1;
    const sx = displayProps?.sx;
    // Round scaled measurements to whole pixels to keep text aligned when
    // switching between static text and inputs.
    const px = (value: number) => Math.round(value * scale);

    const cardHeight = px(BASE.cardHeight);
    const nameLineHeight = px(BASE.nameLineHeight);
    const homePrefixLineHeight = px(BASE.homePrefixLineHeight);

    const nameTextSx = {
        fontFamily: 'monospace',
        fontWeight: 600,
        fontSize: px(BASE.nameFontSize),
        lineHeight: `${nameLineHeight}px`,
    } as const;

    const homePrefixTextSx = {
        fontFamily: 'monospace',
        fontSize: px(BASE.homePrefixFontSize),
        lineHeight: `${homePrefixLineHeight}px`,
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

    const cardSx: SystemStyleObject<Theme> = {
        alignItems: 'center',
        height: cardHeight,
        overflow: 'hidden',
    };

    // Stretched to the monogram so the name's line box starts at its top edge
    // and the home prefix ends at its bottom, rather than the pair floating
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

    const homePrefixIconSize = px(BASE.homePrefixFontSize);

    // The catalog name the two lines add up to, and what the tile's color is
    // hashed from. An unnamed entity stands in its placeholder, so the card
    // always has something to hash.
    //
    // A prefix picks up its trailing slash when the edit is committed, so the
    // slash is added here too. Without it the name the color comes from changes
    // on the way out of the edit, and the tile would settle on one color while
    // typing and then move to another.
    const catalogName = `${appendWithForwardSlash(homePrefix)}${
        hasLength(name) ? name : NAME_PLACEHOLDER
    }`;

    const [editingName, setEditingName] = useState(false);
    const [editingHomePrefix, setEditingHomePrefix] = useState(false);

    const nameInputRef = useRef<HTMLInputElement>(null);

    // Show the home prefix's helper on the name row while editing the prefix.
    const showHomePrefixHelper = Boolean(editProps) && editingHomePrefix;

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

    const nameSx = {
        ...nameTextSx,
        // Fills the row beside the randomize button.
        flex: 1,
        color: 'text.primary',
    };

    const homePrefixSx = {
        ...homePrefixTextSx,
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
            <Monogram
                catalogName={
                    displayProps?.catalogName ??
                    (hasLength(name) ? catalogName : '')
                }
                size={cardHeight}
            />
            <Box sx={columnSx}>
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            display: 'flex',
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        <Fade
                            in={
                                !hasLength(editProps?.homePrefixHelperText) ||
                                !showHomePrefixHelper
                            }
                            timeout={HELPER_FADE_MS}
                            appear={false}
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
                                        }}
                                        placeholder={
                                            editProps ? NAME_PLACEHOLDER : ''
                                        }
                                        inputRef={nameInputRef}
                                        inputProps={{
                                            'aria-label': 'Name',
                                            ...getAutofillIgnoreProps(),
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
                                                      setEditingName(true);
                                                  }
                                                : undefined
                                        }
                                    />
                                )}
                            </Box>
                        </Fade>
                        {hasLength(editProps?.homePrefixHelperText) ? (
                            <Fade
                                in={showHomePrefixHelper}
                                timeout={HELPER_FADE_MS}
                            >
                                <Box
                                    sx={{
                                        ...nameHelperSx,
                                        ...TRUNCATE_SX,
                                        position: 'absolute',
                                        inset: 0,
                                        color: 'text.secondary',
                                    }}
                                >
                                    {editProps?.homePrefixHelperText}
                                </Box>
                            </Fade>
                        ) : null}
                    </Box>
                    {editProps && editingName ? (
                        <Tooltip title="Generate name">
                            <IconButton
                                size="small"
                                onClick={editProps?.onRegenerate}
                                // Keep focus on the input
                                onMouseDown={(event) => event.preventDefault()}
                                aria-label="Generate name"
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
                <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ alignItems: 'center', minWidth: 0, flex: 'none' }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flex: 'none',
                            color: 'text.secondary',
                        }}
                    >
                        <Home
                            width={homePrefixIconSize}
                            height={homePrefixIconSize}
                        />
                    </Box>
                    <Box
                        sx={{
                            ...homePrefixTextSx,
                            display: 'flex',
                            minWidth: 0,
                            flex: 1,
                            color: 'text.secondary',
                        }}
                    >
                        {editProps && editingHomePrefix ? (
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
                                                ...homePrefixTextSx,
                                                color: 'text.secondary',
                                            },
                                    },
                                ]}
                            >
                                <LeavesAutocomplete
                                    leaves={editProps?.leaves ?? []}
                                    value={homePrefix}
                                    onChange={(value) =>
                                        editProps?.onHomePrefixChange(value)
                                    }
                                    onBlur={() => setEditingHomePrefix(false)}
                                    label="Home prefix"
                                    textFieldVariant="standard"
                                    autoFocus
                                    required
                                />
                            </Box>
                        ) : (
                            <FieldText
                                value={homePrefix}
                                placeholder={
                                    editProps ? HOME_PREFIX_PLACEHOLDER : ''
                                }
                                label="home prefix"
                                textSx={homePrefixSx}
                                onEdit={
                                    editProps
                                        ? () => {
                                              setEditingHomePrefix(true);
                                          }
                                        : undefined
                                }
                            />
                        )}
                    </Box>
                </Stack>
            </Box>
        </Stack>
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
