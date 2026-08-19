import type { SxProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system/styleFunctionSx';
import type { Capability } from 'src/types';

import { useEffect, useRef, useState } from 'react';

import {
    Box,
    Button,
    ButtonBase,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    FormControlLabel,
    formHelperTextClasses,
    IconButton,
    InputBase,
    inputBaseClasses,
    inputClasses,
    inputLabelClasses,
    Stack,
    Switch,
    Tooltip,
    Typography,
} from '@mui/material';

import { EditPencil, Refresh } from 'iconoir-react';

import { useCreateServiceAccount } from 'src/api/gql/serviceAccounts';
import { CapabilitySelector } from 'src/components/admin/ServiceAccounts/CapabilitySelector';
import {
    monogram,
    MONOGRAM_TEXT_COLOR,
    monogramColor,
} from 'src/components/admin/ServiceAccounts/shared';
import { usePrefixLeaves } from 'src/components/admin/ServiceAccounts/usePrefixLeaves';
import AlertBox from 'src/components/shared/AlertBox';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import { LeavesAutocomplete } from 'src/components/shared/LeavesAutocomplete/LeavesAutocomplete';
import { defaultOutline } from 'src/context/Theme';
import { useDebouncedValue } from 'src/hooks/useDebouncedValue';
import { generateAlliterativeName } from 'src/utils/alliterate';
import { hasLength } from 'src/utils/misc-utils';

const TITLE_ID = 'create-service-account';

// How long typing has to pause before the preview color moves, and how long it
// takes to get there.
const NAME_COLOR_DEBOUNCE_MS = 400;
const NAME_COLOR_FADE_MS = 1000;

interface CreateServiceAccountDialogProps {
    open: boolean;
    onClose: () => void;
    onCreated?: (catalogName: string) => void;
}

// The monogram is squared off the row height, so the two track together.
const IDENTITY_HEIGHT = 72;

const NAME_EDIT_ICON_CLASS = 'service-account-name-edit';

// Shared by the read-only name and the input it swaps to, so the text keeps its
// size and position across the two states.
const NAME_FONT_SIZE = 16;
const NAME_LINE_HEIGHT = 24;

const NAME_TEXT_SX = {
    fontFamily: 'monospace',
    fontWeight: 600,
    fontSize: NAME_FONT_SIZE,
    // Pinned rather than left to each element's default. The input and the
    // read-only span derive different line boxes otherwise, and the name shifts
    // vertically as the two swap.
    lineHeight: `${NAME_LINE_HEIGHT}px`,
} as const;

const TRUNCATE_SX = {
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
} as const;

const IDENTITY_SX: SxProps<Theme> = {
    alignItems: 'center',
    height: IDENTITY_HEIGHT,
    bgcolor: (theme) => theme.palette.background.code,
    borderRadius: (theme) => theme.radius.md,
    overflow: 'hidden',
    p: 1,
};

// The name reads as plain text until it is clicked. The pencil keeps its place
// in the layout at all times and only fades in on hover, so revealing it does
// not shift the name.
const NAME_BUTTON_SX: SystemStyleObject<Theme> = {
    minWidth: 0,
    flex: 1,
    gap: 0.75,
    justifyContent: 'flex-start',
    cursor: 'pointer',
    ...NAME_TEXT_SX,
    color: 'text.primary',
    [`& .${NAME_EDIT_ICON_CLASS}`]: {
        flex: 'none',
        // Muted against the name it sits beside, so it reads as an affordance
        // rather than part of the text.
        color: 'text.secondary',
        opacity: 0,
        transition: 'opacity 150ms ease',
    },
    [`&:hover .${NAME_EDIT_ICON_CLASS}, &:focus-visible .${NAME_EDIT_ICON_CLASS}`]:
        { opacity: 1 },
};

// Both inputs sit directly on the identity surface. They carry no border until
// hovered or focused, so the block reads as the card the account will become
// while still inviting an edit.
const INLINE_INPUT_SX: SystemStyleObject<Theme> = {
    'borderRadius': (theme) => theme.radius.sm,
    // 'border': '1px solid transparent',
    '&:hover': { borderColor: 'text.disabled' },
    '&:focus-within': { borderColor: 'primary.main' },
};

// The shared autocomplete ships a floating label and a two-line helper-text
// reservation. Neither fits on a single row, so the label is hidden from sight
// but left for screen readers, and the underline and helper slot are collapsed.
const INLINE_AUTOCOMPLETE_SX: SystemStyleObject<Theme> = {
    // The standard variant reserves 16px above itself for a floating label that
    // is hidden here. Left in, it pushes the column past the row's padding.
    [`& .${inputBaseClasses.formControl}`]: { mt: 0 },
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
    [`& .${inputBaseClasses.input}`]: {
        p: 0,
        fontSize: 13,
        color: 'text.secondary',
    },
};

const MONOGRAM_SX: SxProps<Theme> = {
    height: '100%',
    aspectRatio: '1 / 1',
    flex: 'none',
    borderRadius: (theme) => theme.radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 700,
    // Carried in both states so the tile keeps its footprint, and so the empty
    // state can fade in and out rather than snap.
    border: '1px dashed transparent',
    transition: `background ${NAME_COLOR_FADE_MS}ms ease, border-color ${NAME_COLOR_FADE_MS}ms ease, color ${NAME_COLOR_FADE_MS}ms ease`,
};

interface IdentityFieldsProps {
    name: string;
    onNameChange: (name: string) => void;
    location: string;
    onLocationChange: (location: string) => void;
    leaves: string[];
    namePreview: string;
    onRegenerate: () => void;
}

// The account's identity, laid out as the card it will become once it exists:
// the monogram tile over its stable color, the name, and the catalog location
// beneath it. The name and location are edited in place rather than through
// separate labelled fields above a preview.
//
// The tile color is derived per keystroke, so it settles once typing pauses and
// crossfades to its new value instead of strobing through a hue per character.
// The debounce lives here rather than in the dialog so it unmounts with the
// dialog content. Held one level up it would survive a close, and the next time
// the dialog opened the tile would start on the last session's color and fade
// off it.
function IdentityFields({
    name,
    onNameChange,
    location,
    onLocationChange,
    leaves,
    namePreview,
    onRegenerate,
}: IdentityFieldsProps) {
    // `namePreview` substitutes a placeholder leaf for an unnamed account.
    // Hashing that placeholder would assign a color the account will never
    // wear, so the unnamed case is carried through as an empty string.
    const [editing, setEditing] = useState(false);

    // Held so Escape can put the name back. Without it Escape would reach the
    // dialog and close the whole thing mid-edit.
    const [nameBeforeEdit, setNameBeforeEdit] = useState(name);

    const nameInputRef = useRef<HTMLInputElement>(null);

    // Focus lands here rather than on `autoFocus` so the caret can be placed
    // deliberately: at the end of the name, ready to be extended. The effect is
    // keyed on `editing` alone, so typing never moves the caret back.
    useEffect(() => {
        const node = nameInputRef.current;

        if (!editing || !node) {
            return;
        }

        node.focus();
        node.setSelectionRange(node.value.length, node.value.length);
    }, [editing]);

    const settledIdentity = useDebouncedValue(
        hasLength(name) ? namePreview : '',
        NAME_COLOR_DEBOUNCE_MS
    );

    // The tile's color and its painted/unpainted state both come off the
    // settled value. Reading the state from the live name instead would paint
    // the tile a keystroke before its color resolved, and the fade would pass
    // through whatever color the stale value still held.
    const painted = hasLength(settledIdentity);

    // The letter tracks the live name, so it lands on the keystroke rather than
    // waiting out the debounce. Between the two it sits on an unpainted tile,
    // where the dark-on-color monogram would be invisible, so it borrows the
    // body text color until the tile fills in behind it.
    const letter = hasLength(name) ? monogram(namePreview) : null;

    return (
        <Stack direction="row" spacing={1.5} sx={IDENTITY_SX}>
            <Box
                sx={{
                    ...MONOGRAM_SX,
                    background: painted
                        ? monogramColor(settledIdentity)
                        : 'transparent',
                    borderColor: painted ? 'transparent' : 'text.disabled',
                    color: painted ? MONOGRAM_TEXT_COLOR : 'text.secondary',
                }}
            >
                {letter}
            </Box>

            <Box
                sx={{
                    minWidth: 0,
                    flex: 1,
                    // Stretched to the monogram so the name's line box starts at
                    // its top edge and the location ends at its bottom, rather
                    // than the pair floating centered against it.
                    alignSelf: 'stretch',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                >
                    {editing ? (
                        <InputBase
                            value={name}
                            onChange={(event) =>
                                onNameChange(
                                    event.target.value
                                        .replace(/[^a-z0-9-]/gi, '')
                                        .toLowerCase()
                                )
                            }
                            onBlur={() => setEditing(false)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    setEditing(false);
                                }

                                if (event.key === 'Escape') {
                                    // Kept off the dialog, which would take it
                                    // as a request to close.
                                    event.stopPropagation();
                                    onNameChange(nameBeforeEdit);
                                    setEditing(false);
                                }
                            }}
                            placeholder="service-account"
                            inputRef={nameInputRef}
                            inputProps={{ 'aria-label': 'Name' }}
                            sx={{
                                ...INLINE_INPUT_SX,
                                flex: 1,
                                minWidth: 0,
                                ...NAME_TEXT_SX,
                                color: 'text.primary',
                                // MUI fixes the input at 1.4375em, which overrides the
                                // line box and leaves it a pixel shorter than
                                // the read-only span.
                                [`& .${inputBaseClasses.input}`]: {
                                    p: 0,
                                    height: 'auto',
                                },
                            }}
                        />
                    ) : (
                        <ButtonBase
                            onClick={() => {
                                setNameBeforeEdit(name);
                                setEditing(true);
                            }}
                            disableRipple
                            aria-label={`Edit name, currently ${
                                hasLength(name) ? name : 'unset'
                            }`}
                            sx={NAME_BUTTON_SX}
                        >
                            <Box
                                component="span"
                                sx={{
                                    ...TRUNCATE_SX,
                                    color: hasLength(name)
                                        ? 'text.primary'
                                        : 'text.disabled',
                                }}
                            >
                                {hasLength(name) ? name : 'service-account'}
                            </Box>

                            <EditPencil
                                width={14}
                                height={14}
                                className={NAME_EDIT_ICON_CLASS}
                            />
                        </ButtonBase>
                    )}

                    {editing ? (
                        <Tooltip title="Generate a new name">
                            <IconButton
                                size="small"
                                onClick={onRegenerate}
                                // Keep focus on the input, so regenerating does
                                // not blur out of edit mode.
                                onMouseDown={(event) => event.preventDefault()}
                                aria-label="Generate a new name"
                                // Boxed to the name's line height. Left at its
                                // natural size it is the tallest thing on the
                                // row and pushes the name down off the
                                // monogram's top edge.
                                sx={{
                                    flex: 'none',
                                    p: 0,
                                    width: NAME_LINE_HEIGHT,
                                    height: NAME_LINE_HEIGHT,
                                }}
                            >
                                <Refresh width={18} height={18} />
                            </IconButton>
                        </Tooltip>
                    ) : null}
                </Stack>

                <Box sx={[INLINE_INPUT_SX, INLINE_AUTOCOMPLETE_SX]}>
                    <LeavesAutocomplete
                        leaves={leaves}
                        value={location}
                        onChange={onLocationChange}
                        label="Catalog location"
                        textFieldVariant="standard"
                        required
                    />
                </Box>
            </Box>
        </Stack>
    );
}

export function CreateServiceAccountDialog({
    open,
    onClose,
    onCreated,
}: CreateServiceAccountDialogProps) {
    const { leaves, selectedTenant } = usePrefixLeaves();

    const [{ fetching }, createServiceAccount] = useCreateServiceAccount();

    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [grantOn, setGrantOn] = useState(true);
    const [quickCapability, setQuickCapability] = useState<Capability>('read');
    const [error, setError] = useState<string | null>(null);

    const regenerateName = () => setName(generateAlliterativeName());

    // Seed the form whenever the dialog opens, or when the tenant arrives after
    // it is already open. This runs during render, so the first frame the user
    // sees already holds the new values. An effect would commit one frame of the
    // previous session's name first, and the preview color would then crossfade
    // away from a name that was never on screen.
    const [seededFor, setSeededFor] = useState({ open, selectedTenant });

    if (
        open !== seededFor.open ||
        selectedTenant !== seededFor.selectedTenant
    ) {
        setSeededFor({ open, selectedTenant });

        if (open) {
            setName(generateAlliterativeName());
            setLocation(selectedTenant);
            setGrantOn(true);
            setQuickCapability('read');
            setError(null);
        }
    }

    const catalogName = `${location}${name}`;
    const namePreview = `${location}/${name || 'service-account'}`.replace(
        /\/\//g,
        '/'
    );
    const identityComplete = hasLength(name) && hasLength(location);

    const handleSubmit = async () => {
        setError(null);

        if (!identityComplete) {
            return;
        }

        const grants = grantOn
            ? [{ prefix: location, capability: quickCapability }]
            : [];

        const result = await createServiceAccount({ catalogName, grants });

        if (result.error) {
            setError(result.error.message);
            return;
        }

        onClose();
        onCreated?.(catalogName);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby={TITLE_ID}
        >
            <DialogTitleWithClose
                id={TITLE_ID}
                onClose={onClose}
                disabled={fetching}
            >
                Create service account
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 400 }}
                >
                    A non-login identity for programmatic access.
                </Typography>
            </DialogTitleWithClose>

            <DialogContent>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    {error ? (
                        <AlertBox severity="error" short>
                            <Typography>{error}</Typography>
                        </AlertBox>
                    ) : null}

                    <Stack spacing={1}>
                        <IdentityFields
                            name={name}
                            onNameChange={setName}
                            location={location}
                            onLocationChange={setLocation}
                            leaves={leaves}
                            namePreview={namePreview}
                            onRegenerate={regenerateName}
                        />

                        <Typography variant="caption" color="text.secondary">
                            Lowercase letters, numbers and dashes. Must be
                            unique.
                        </Typography>
                    </Stack>

                    <Box
                        sx={{
                            p: 2,
                            borderRadius: (theme) => theme.radius.md,
                            border: (theme) =>
                                defaultOutline[theme.palette.mode],
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={grantOn}
                                    onChange={(event) =>
                                        setGrantOn(event.target.checked)
                                    }
                                />
                            }
                            label="Grant access to this prefix"
                        />

                        <Collapse in={grantOn}>
                            <>
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    sx={{
                                        mt: 1.5,
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            fontFamily: 'monospace',
                                            minWidth: 0,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {location}
                                    </Typography>
                                    <CapabilitySelector
                                        value={quickCapability}
                                        onChange={setQuickCapability}
                                    />
                                </Stack>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: 'block', mt: 1.5 }}
                                >
                                    Grants the same prefix the account lives
                                    under. Need different or multiple prefixes?
                                    Add grants later from the account details
                                    page.
                                </Typography>
                            </>
                        </Collapse>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions
                sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}
            >
                <Button variant="text" onClick={onClose} disabled={fetching}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!identityComplete || fetching}
                    loading={fetching}
                >
                    Create service account
                </Button>
            </DialogActions>
        </Dialog>
    );
}
