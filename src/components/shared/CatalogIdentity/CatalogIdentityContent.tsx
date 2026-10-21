import type { SxProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system/styleFunctionSx';

import { useRef, useState } from 'react';

import {
    autocompleteClasses,
    Box,
    Fade,
    formHelperTextClasses,
    inputBaseClasses,
    inputClasses,
    inputLabelClasses,
    Stack,
} from '@mui/material';

import { Home } from 'iconoir-react';
import { flushSync } from 'react-dom';

import { InlineEditableField } from 'src/components/shared/CatalogIdentity/InlineEditableField';
import { Monogram } from 'src/components/shared/CatalogIdentity/Monogram';
import { NameInput } from 'src/components/shared/CatalogIdentity/NameInput';
import { LeavesAutocomplete } from 'src/components/shared/LeavesAutocomplete/LeavesAutocomplete';
import {
    ensureTrailingSlash,
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

    const catalogName = `${homePrefix ? ensureTrailingSlash(homePrefix) : ''}${
        hasLength(name) ? name : NAME_PLACEHOLDER
    }`;

    const [showHomePrefixHelper, setShowHomePrefixHelper] = useState(false);
    const nameButtonRef = useRef<HTMLButtonElement>(null);
    const homePrefixButtonRef = useRef<HTMLButtonElement>(null);

    const nameSx = {
        ...nameTextSx,
        flex: 1,
        color: 'text.primary',
    };

    const homePrefixSx = {
        ...homePrefixTextSx,
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
                                <InlineEditableField
                                    buttonRef={nameButtonRef}
                                    onTab={(event) => {
                                        if (!event.shiftKey) {
                                            event.preventDefault();
                                            homePrefixButtonRef.current?.click();
                                        }
                                    }}
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
                        <InlineEditableField
                            editable={Boolean(editProps)}
                            onEditingChange={setShowHomePrefixHelper}
                            buttonRef={homePrefixButtonRef}
                            onTab={(event) => {
                                if (event.shiftKey) {
                                    event.preventDefault();
                                    // Reveal the name row before mounting its autofocus input.
                                    flushSync(() =>
                                        setShowHomePrefixHelper(false)
                                    );
                                    nameButtonRef.current?.click();
                                }
                            }}
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
