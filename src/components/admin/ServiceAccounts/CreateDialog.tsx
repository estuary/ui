import type { SxProps, Theme } from '@mui/material';
import type { Capability } from 'src/types';

import { useEffect, useRef, useState } from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Stack,
    Step,
    StepLabel,
    Stepper,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';

import { NavArrowLeft, Plus, Refresh, Trash } from 'iconoir-react';

import {
    useCreateApiKey,
    useCreateServiceAccount,
} from 'src/api/gql/serviceAccounts';
import { CapabilitySelector } from 'src/components/admin/ServiceAccounts/CapabilitySelector';
import { LifetimeSelector } from 'src/components/admin/ServiceAccounts/LifetimeSelector';
import { SecretRevealModal } from 'src/components/admin/ServiceAccounts/SecretRevealModal';
import {
    DEFAULT_LIFETIME,
    formatExpiryFromNow,
} from 'src/components/admin/ServiceAccounts/shared';
import { usePrefixLeaves } from 'src/components/admin/ServiceAccounts/usePrefixLeaves';
import AlertBox from 'src/components/shared/AlertBox';
import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';
import DialogTitleWithClose from 'src/components/shared/Dialog/TitleWithClose';
import { LeavesAutocomplete } from 'src/components/shared/LeavesAutocomplete/LeavesAutocomplete';
import OutlinedToggleButtonGroup from 'src/components/shared/OutlinedToggleButtonGroup';
import { codeBackground, defaultOutline } from 'src/context/Theme';
import { generateAlliterativeName } from 'src/utils/alliterate';
import { hasLength } from 'src/utils/misc-utils';
import { stringToColor } from 'src/utils/stableColor';

const TITLE_ID = 'create-service-account';
const GUIDED_STEPS = ['Identity', 'Access', 'API key'];

type CreateMode = 'quick' | 'guided';

interface GuidedGrant {
    prefix: string;
    capability: Capability;
}

interface RevealState {
    secret: string;
    description: string;
    expires: string;
    account: string;
}

interface CreateServiceAccountDialogProps {
    open: boolean;
    mode: CreateMode;
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
    mode,
    onClose,
    onCreated,
}: CreateServiceAccountDialogProps) {
    const { leaves, selectedTenant } = usePrefixLeaves();

    const [{ fetching: creatingAccount }, createServiceAccount] =
        useCreateServiceAccount();
    const [{ fetching: creatingToken }, createApiKey] = useCreateApiKey();
    const fetching = creatingAccount || creatingToken;

    const [localMode, setLocalMode] = useState<CreateMode>(mode);
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [grantOn, setGrantOn] = useState(true);
    const [quickCapability, setQuickCapability] = useState<Capability>('read');
    const [guidedGrants, setGuidedGrants] = useState<GuidedGrant[]>([]);
    const [step, setStep] = useState(1);
    const [makeKey, setMakeKey] = useState(true);
    const [keyDesc, setKeyDesc] = useState('');
    const [keyLife, setKeyLife] = useState(DEFAULT_LIFETIME);
    const [error, setError] = useState<string | null>(null);
    const [reveal, setReveal] = useState<RevealState | null>(null);
    const [createdName, setCreatedName] = useState<string | null>(null);

    const nameInputRef = useRef<HTMLInputElement>(null);

    const regenerateName = () => setName(generateAlliterativeName());

    useEffect(() => {
        if (!open) {
            return;
        }

        setLocalMode(mode);
        setName(generateAlliterativeName());
        setLocation(selectedTenant);
        setGrantOn(true);
        setQuickCapability('read');
        setGuidedGrants([{ prefix: selectedTenant, capability: 'read' }]);
        setStep(1);
        setMakeKey(true);
        setKeyDesc('');
        setKeyLife(DEFAULT_LIFETIME);
        setError(null);
        setReveal(null);
        setCreatedName(null);
    }, [open, mode, selectedTenant]);

    const catalogName = `${location}${name}`;
    const namePreview = `${location}/${name || 'service-account'}`.replace(
        /\/\//g,
        '/'
    );
    const identityComplete = hasLength(name) && hasLength(location);

    const updateGuidedGrant = (index: number, patch: Partial<GuidedGrant>) => {
        setGuidedGrants((prev) =>
            prev.map((grant, i) =>
                i === index ? { ...grant, ...patch } : grant
            )
        );
    };

    const addGuidedGrant = () => {
        setGuidedGrants((prev) => [
            ...prev,
            { prefix: selectedTenant, capability: 'read' },
        ]);
    };

    const removeGuidedGrant = (index: number) => {
        setGuidedGrants((prev) => prev.filter((_, i) => i !== index));
    };

    const finishCreated = (createdCatalogName: string) => {
        onClose();
        onCreated?.(createdCatalogName);
    };

    const handleRevealDone = () => {
        const name_ = createdName;
        setReveal(null);
        setCreatedName(null);
        onClose();
        if (name_) {
            onCreated?.(name_);
        }
    };

    const handleSubmit = async () => {
        setError(null);

        if (!identityComplete) {
            return;
        }

        const grants =
            localMode === 'quick'
                ? grantOn
                    ? [{ prefix: location, capability: quickCapability }]
                    : []
                : guidedGrants.filter((grant) => hasLength(grant.prefix));

        const result = await createServiceAccount({ catalogName, grants });

        if (result.error) {
            setError(result.error.message);
            return;
        }

        if (localMode === 'guided' && makeKey) {
            const tokenResult = await createApiKey({
                catalogName,
                detail: keyDesc || 'Default key',
                validFor: keyLife,
            });

            if (tokenResult.error || !tokenResult.data?.createApiKey) {
                // The account exists; only the key failed. Surface it but move
                // on to the account so the user can retry the key there.
                setError(
                    tokenResult.error?.message ??
                        'The account was created, but its API key could not be generated.'
                );
                finishCreated(catalogName);
                return;
            }

            setCreatedName(catalogName);
            setReveal({
                secret: tokenResult.data.createApiKey.secret,
                description: keyDesc || 'API key',
                expires: formatExpiryFromNow(keyLife),
                account: catalogName,
            });
            return;
        }

        finishCreated(catalogName);
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
                    color: stringToColor(namePreview),
                }}
            >
                {namePreview}
            </Typography>
        </Box>
    );

    return (
        <>
            <Dialog
                open={Boolean(open && !reveal)}
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
                        <OutlinedToggleButtonGroup
                            exclusive
                            size="small"
                            value={localMode}
                            onChange={(_event, next: CreateMode | null) => {
                                if (next) {
                                    setLocalMode(next);
                                    setStep(1);
                                }
                            }}
                        >
                            <OutlinedToggleButton value="quick">
                                Quick setup
                            </OutlinedToggleButton>
                            <OutlinedToggleButton value="guided">
                                Guided
                            </OutlinedToggleButton>
                        </OutlinedToggleButtonGroup>

                        {error ? (
                            <AlertBox severity="error" short>
                                <Typography>{error}</Typography>
                            </AlertBox>
                        ) : null}

                        {localMode === 'quick' ? (
                            <>
                                {nameField}
                                {locationField}
                                {fullNamePreview}

                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: (theme) =>
                                            theme.radius.md,
                                        border: (theme) =>
                                            defaultOutline[theme.palette.mode],
                                    }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={grantOn}
                                                onChange={(event) =>
                                                    setGrantOn(
                                                        event.target.checked
                                                    )
                                                }
                                            />
                                        }
                                        label="Grant access to this prefix"
                                    />

                                    {grantOn ? (
                                        <>
                                            <Stack
                                                direction="row"
                                                spacing={1.5}
                                                sx={{
                                                    mt: 1.5,
                                                    alignItems: 'center',
                                                    justifyContent:
                                                        'space-between',
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        fontFamily: 'monospace',
                                                        minWidth: 0,
                                                        overflow: 'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {location}
                                                </Typography>
                                                <CapabilitySelector
                                                    value={quickCapability}
                                                    onChange={
                                                        setQuickCapability
                                                    }
                                                />
                                            </Stack>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display: 'block',
                                                    mt: 1.5,
                                                }}
                                            >
                                                Quick setup grants the same
                                                prefix the account lives under.
                                                Need different or multiple
                                                prefixes? Switch to Guided, or
                                                add grants later from the
                                                account.
                                            </Typography>
                                        </>
                                    ) : null}
                                </Box>
                            </>
                        ) : (
                            <>
                                <Stepper
                                    activeStep={step - 1}
                                    alternativeLabel
                                    sx={{ mb: 1 }}
                                >
                                    {GUIDED_STEPS.map((label) => (
                                        <Step key={label}>
                                            <StepLabel>{label}</StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>

                                {step === 1 ? (
                                    <>
                                        {nameField}
                                        {locationField}
                                        {fullNamePreview}
                                    </>
                                ) : null}

                                {step === 2 ? (
                                    <>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Grant this account access to one or
                                            more catalog prefixes. You can
                                            change these anytime.
                                        </Typography>

                                        {guidedGrants.map((grant, index) => (
                                            <Stack
                                                // eslint-disable-next-line react/no-array-index-key
                                                key={index}
                                                direction="row"
                                                spacing={1}
                                                sx={{ alignItems: 'center' }}
                                            >
                                                <Box
                                                    sx={{
                                                        flex: 1,
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <LeavesAutocomplete
                                                        leaves={leaves}
                                                        value={grant.prefix}
                                                        onChange={(value) =>
                                                            updateGuidedGrant(
                                                                index,
                                                                {
                                                                    prefix: value,
                                                                }
                                                            )
                                                        }
                                                        label="Catalog prefix"
                                                    />
                                                </Box>
                                                <CapabilitySelector
                                                    value={grant.capability}
                                                    onChange={(capability) =>
                                                        updateGuidedGrant(
                                                            index,
                                                            { capability }
                                                        )
                                                    }
                                                />
                                                <IconButton
                                                    aria-label="Remove grant"
                                                    onClick={() =>
                                                        removeGuidedGrant(index)
                                                    }
                                                >
                                                    <Trash />
                                                </IconButton>
                                            </Stack>
                                        ))}

                                        <Button
                                            variant="outlined"
                                            startIcon={<Plus />}
                                            onClick={addGuidedGrant}
                                            sx={{ alignSelf: 'flex-start' }}
                                        >
                                            Add another grant
                                        </Button>
                                    </>
                                ) : null}

                                {step === 3 ? (
                                    <>
                                        <Box>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={makeKey}
                                                        onChange={(event) =>
                                                            setMakeKey(
                                                                event.target
                                                                    .checked
                                                            )
                                                        }
                                                    />
                                                }
                                                label="Create an API key now"
                                            />
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ display: 'block' }}
                                            >
                                                The secret is shown once on the
                                                next screen. You can always
                                                create keys later.
                                            </Typography>
                                        </Box>

                                        {makeKey ? (
                                            <>
                                                <TextField
                                                    label="Description"
                                                    value={keyDesc}
                                                    onChange={(event) =>
                                                        setKeyDesc(
                                                            event.target.value
                                                        )
                                                    }
                                                    size="small"
                                                    fullWidth
                                                    placeholder="CI deploy pipeline"
                                                    helperText="Helps you recognise this key later."
                                                />
                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ mb: 1 }}
                                                    >
                                                        Lifetime
                                                    </Typography>
                                                    <LifetimeSelector
                                                        value={keyLife}
                                                        onChange={setKeyLife}
                                                    />
                                                </Box>
                                            </>
                                        ) : null}
                                    </>
                                ) : null}
                            </>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}
                >
                    {localMode === 'guided' && step > 1 ? (
                        <Button
                            variant="text"
                            startIcon={<NavArrowLeft />}
                            onClick={() => setStep((prev) => prev - 1)}
                            disabled={fetching}
                        >
                            Back
                        </Button>
                    ) : (
                        <Button
                            variant="text"
                            onClick={onClose}
                            disabled={fetching}
                        >
                            Cancel
                        </Button>
                    )}

                    {localMode === 'guided' && step < 3 ? (
                        <Button
                            variant="contained"
                            onClick={() => setStep((prev) => prev + 1)}
                            disabled={Boolean(step === 1 && !identityComplete)}
                        >
                            Continue
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={!identityComplete || fetching}
                            loading={fetching}
                        >
                            {localMode === 'guided' && makeKey
                                ? 'Create & generate key'
                                : 'Create service account'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <SecretRevealModal
                open={Boolean(reveal)}
                secret={reveal?.secret ?? ''}
                description={reveal?.description ?? ''}
                expires={reveal?.expires ?? ''}
                account={reveal?.account ?? ''}
                onDone={handleRevealDone}
            />
        </>
    );
}
