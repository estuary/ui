import type { SxProps, Theme } from '@mui/material';
import type { Capability } from 'src/types';

import { useEffect, useRef, useState } from 'react';

import {
    Box,
    Button,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';

import { Refresh } from 'iconoir-react';

import { useCreateServiceAccount } from 'src/api/gql/serviceAccounts';
import { CapabilitySelector } from 'src/components/admin/ServiceAccounts/CapabilitySelector';
import { usePrefixLeaves } from 'src/components/admin/ServiceAccounts/usePrefixLeaves';
import AlertBox from 'src/components/shared/AlertBox';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import { LeavesAutocomplete } from 'src/components/shared/LeavesAutocomplete/LeavesAutocomplete';
import { codeBackground, defaultOutline } from 'src/context/Theme';
import { useDebouncedValue } from 'src/hooks/useDebouncedValue';
import { generateAlliterativeName } from 'src/utils/alliterate';
import { hasLength } from 'src/utils/misc-utils';
import { stringToColor } from 'src/utils/stableColor';

const TITLE_ID = 'create-service-account';

// The full-name preview is tinted with the account's stable color. The name is
// derived per keystroke, so the color settles once typing pauses and crossfades
// to its new value instead of strobing through a hue per character.
const NAME_COLOR_DEBOUNCE_MS = 400;
const NAME_COLOR_FADE_MS = 1000;

interface CreateServiceAccountDialogProps {
    open: boolean;
    onClose: () => void;
    onCreated?: (catalogName: string) => void;
}

const FULL_NAME_SX: SxProps<Theme> = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    px: 1.5,
    py: 1.25,
    borderRadius: (theme) => theme.radius.sm,
    bgcolor: (theme) => codeBackground[theme.palette.mode],
};

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

    const nameInputRef = useRef<HTMLInputElement>(null);

    const regenerateName = () => setName(generateAlliterativeName());

    useEffect(() => {
        if (!open) {
            return;
        }

        setName(generateAlliterativeName());
        setLocation(selectedTenant);
        setGrantOn(true);
        setQuickCapability('read');
        setError(null);
    }, [open, selectedTenant]);

    const catalogName = `${location}${name}`;
    const namePreview = `${location}/${name || 'service-account'}`.replace(
        /\/\//g,
        '/'
    );
    const identityComplete = hasLength(name) && hasLength(location);

    const settledNamePreview = useDebouncedValue(
        namePreview,
        NAME_COLOR_DEBOUNCE_MS
    );

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

    const nameField = (
        <TextField
            label="Name"
            value={name}
            onChange={(event) =>
                setName(
                    event.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase()
                )
            }
            inputRef={nameInputRef}
            autoFocus
            size="small"
            fullWidth
            required
            placeholder="banana-bot"
            helperText="Lowercase letters, numbers and dashes. Must be unique."
            slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <Tooltip title="Generate a new name">
                                <IconButton
                                    size="small"
                                    edge="end"
                                    onClick={regenerateName}
                                    aria-label="Generate a new name"
                                >
                                    <Refresh width={18} height={18} />
                                </IconButton>
                            </Tooltip>
                        </InputAdornment>
                    ),
                },
            }}
        />
    );

    const locationField = (
        <LeavesAutocomplete
            leaves={leaves}
            value={location}
            onChange={setLocation}
            label="Catalog location"
            required
        />
    );

    const fullNamePreview = (
        <Box sx={FULL_NAME_SX}>
            <Typography variant="caption" color="text.secondary">
                Full name
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    fontFamily: 'monospace',
                    color: stringToColor(settledNamePreview),
                    transition: `color ${NAME_COLOR_FADE_MS}ms ease`,
                }}
            >
                {namePreview}
            </Typography>
        </Box>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby={TITLE_ID}
            slotProps={{
                transition: {
                    onEntered: () => nameInputRef.current?.select(),
                },
            }}
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

                    {nameField}
                    {locationField}
                    {fullNamePreview}

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
