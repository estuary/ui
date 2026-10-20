import type { SxProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system/styleFunctionSx';
import type { ReactNode, Ref } from 'react';

import { useRef, useState } from 'react';

import {
    autocompleteClasses,
    Box,
    ButtonBase,
    Fade,
    formHelperTextClasses,
    inputBaseClasses,
    inputClasses,
    inputLabelClasses,
    Stack,
} from '@mui/material';

import { EditPencil, Home } from 'iconoir-react';

import { Monogram } from 'src/components/shared/CatalogIdentity/Monogram';
import { NameInput } from 'src/components/shared/CatalogIdentity/NameInput';
import { LeavesAutocomplete } from 'src/components/shared/LeavesAutocomplete/LeavesAutocomplete';
import {
    appendWithForwardSlash,
    hasLength,
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
    borderRadius: (theme) => theme.radius.sm,
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

    const nameHelperSx = {
        fontFamily: 'inherit',
        fontSize: px(BASE.helperFontSize),
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

    const [showHomePrefixHelper, setShowHomePrefixHelper] = useState(false);
    const homePrefixButtonRef = useRef<HTMLButtonElement>(null);

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
                <Stack direction="row" sx={{ alignItems: 'center' }}>
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
                                    display: 'flex',
                                    minWidth: 0,
                                    flex: 1,
                                }}
                            >
                                <FieldText
                                    editable={Boolean(editProps)}
                                    renderEditField={(finishEditing) => (
                                        <NameInput
                                            value={name}
                                            onChange={(value) =>
                                                editProps?.onNameChange(value)
                                            }
                                            onRegenerate={
                                                editProps?.onRegenerate
                                            }
                                            onFinishEditing={finishEditing}
                                            onTabForward={() =>
                                                homePrefixButtonRef.current?.focus()
                                            }
                                            placeholder={NAME_PLACEHOLDER}
                                            inputSx={{
                                                ...INLINE_INPUT_SX,
                                                ...nameSx,
                                            }}
                                            buttonSize={nameLineHeight}
                                        />
                                    )}
                                    value={name}
                                    placeholder={
                                        editProps ? NAME_PLACEHOLDER : ''
                                    }
                                    label="name"
                                    textSx={nameSx}
                                />
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
                            display: 'flex',
                            minWidth: 0,
                            flex: 1,
                        }}
                    >
                        <FieldText
                            editable={Boolean(editProps)}
                            onEditingChange={setShowHomePrefixHelper}
                            buttonRef={homePrefixButtonRef}
                            renderEditField={(finishEditing) => (
                                <Box
                                    sx={[
                                        INLINE_INPUT_SX,
                                        INLINE_AUTOCOMPLETE_SX,
                                        {
                                            flex: 1,
                                            minWidth: 0,
                                            // Outrank MUI's small-input padding rule.
                                            [`&&& .${autocompleteClasses.inputRoot} .${autocompleteClasses.input}`]:
                                                {
                                                    p: 0,
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
                                        onBlur={finishEditing}
                                        label="Home prefix"
                                        textFieldVariant="standard"
                                        autoFocus
                                        required
                                    />
                                </Box>
                            )}
                            value={homePrefix}
                            placeholder={
                                editProps ? HOME_PREFIX_PLACEHOLDER : ''
                            }
                            label="home prefix"
                            textSx={homePrefixSx}
                        />
                    </Box>
                </Stack>
            </Box>
        </Stack>
    );
}

interface FieldTextProps {
    buttonRef?: Ref<HTMLButtonElement>;
    value: string;
    placeholder: string;
    label: string;
    textSx: SystemStyleObject<Theme>;
    editable: boolean;
    onEditingChange?: (editing: boolean) => void;
    renderEditField: (finishEditing: () => void) => ReactNode;
}

// Render static text, an editable value, or the active input for a card field.
function FieldText({
    buttonRef,
    value,
    placeholder,
    label,
    textSx,
    editable,
    onEditingChange,
    renderEditField,
}: FieldTextProps) {
    const [editing, setEditing] = useState(false);
    const changeEditing = (next: boolean) => {
        setEditing(next);
        onEditingChange?.(next);
    };
    const filled = hasLength(value);

    if (!editable) {
        return (
            <Box component="span" sx={{ ...textSx, ...TRUNCATE_SX }}>
                {value}
            </Box>
        );
    }

    if (editing) {
        return renderEditField(() => changeEditing(false));
    }

    return (
        <ButtonBase
            ref={buttonRef}
            onClick={() => changeEditing(true)}
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
