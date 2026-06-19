import { useMemo, useState } from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { useIntl } from 'react-intl';

import { useLiveSpecs } from 'src/api/gql/liveSpecs';
import { useCreateServiceAccount } from 'src/api/gql/serviceAccounts';
import { useStorageMappings } from 'src/api/gql/storageMappings';
import AlertBox from 'src/components/shared/AlertBox';
import { useCouldMatchRoot } from 'src/components/shared/LeavesAutocomplete';
import { LeavesAutocomplete } from 'src/components/shared/LeavesAutocomplete/LeavesAutocomplete';
import { useTenantStore } from 'src/stores/Tenant/Store';
import { hasLength } from 'src/utils/misc-utils';

// 'none' and 'write' intentionally omitted
type Capability = 'admin' | 'read';

interface CreateServiceAccountDialogProps {
    open: boolean;
    onClose: () => void;
}

export function CreateServiceAccountDialog({
    open,
    onClose,
}: CreateServiceAccountDialogProps) {
    const intl = useIntl();

    const [displayName, setDisplayName] = useState('');
    const [prefix, setPrefix] = useState('');
    const [capability, setCapability] = useState<Capability>('admin');
    const [error, setError] = useState<string | null>(null);
    // final (startsWith) validation only applies after blur or submit;
    // typing switches back to partial-only validation
    const [finalEnabled, setFinalEnabled] = useState(false);

    const [{ fetching }, createServiceAccount] = useCreateServiceAccount();

    const { storageMappings } = useStorageMappings();
    const liveSpecNames = useLiveSpecs();
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const couldMatchRoot = useCouldMatchRoot([selectedTenant]);

    // derived during render so the trailing slash LeavesAutocomplete appends
    // on blur (via onChange) is validated rather than the stale value
    const partialResult = couldMatchRoot(prefix);
    const prefixError =
        partialResult !== true
            ? partialResult
            : finalEnabled && !prefix.startsWith(selectedTenant)
              ? intl.formatMessage(
                    { id: 'leavesAutocomplete.mustStartWith.single' },
                    { root: selectedTenant }
                )
              : null;

    // build list of leaves out of live specs and storage mappings,
    // scoped to the globally selected tenant
    const leaves = useMemo(
        () =>
            [
                ...liveSpecNames.map((name) =>
                    // remove the catalog name leaving just the containing prefix
                    name.slice(0, name.lastIndexOf('/') + 1)
                ),
                ...storageMappings.map((sm) => sm.catalogPrefix),
            ].filter((leaf) => leaf.startsWith(selectedTenant)),
        [liveSpecNames, storageMappings, selectedTenant]
    );

    const handlePrefixChange = (value: string) => {
        setPrefix(value);
        setFinalEnabled(false);
    };

    const handlePrefixBlur = () => {
        setFinalEnabled(true);
    };

    const resetForm = () => {
        setDisplayName('');
        setPrefix('');
        setCapability('admin');
        setError(null);
        setFinalEnabled(false);
    };

    const handleClose = () => {
        onClose();
        resetForm();
    };

    const handleCreate = async () => {
        setError(null);

        if (!hasLength(displayName) || !hasLength(prefix)) {
            return;
        }

        if (!prefix.startsWith(selectedTenant)) {
            setFinalEnabled(true);
            return;
        }

        const result = await createServiceAccount({
            displayName,
            prefix,
            capability,
        });

        if (result.error) {
            setError(result.error.message);
            return;
        }

        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create Service Account</DialogTitle>

            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Create a non-login identity scoped to a catalog prefix.
                        The service account will be able to authenticate with
                        API keys.
                    </Typography>

                    {error ? (
                        <AlertBox severity="error" short>
                            <Typography>{error}</Typography>
                        </AlertBox>
                    ) : null}

                    <TextField
                        label="Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        size="small"
                        fullWidth
                        placeholder="e.g. CI deploy bot"
                    />

                    <LeavesAutocomplete
                        leaves={leaves}
                        value={prefix}
                        onChange={handlePrefixChange}
                        onBlur={handlePrefixBlur}
                        label="Prefix"
                        required
                        error={Boolean(prefixError)}
                        errorMessage={prefixError ?? undefined}
                    />

                    <FormControl size="small" fullWidth required>
                        <InputLabel>Capability</InputLabel>
                        <Select
                            value={capability}
                            onChange={(e) =>
                                setCapability(e.target.value as Capability)
                            }
                            label="Capability"
                        >
                            <MenuItem value="admin">admin</MenuItem>
                            <MenuItem value="read">read</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={handleClose}
                    disabled={fetching}
                    variant="outlined"
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleCreate}
                    disabled={
                        !hasLength(displayName) ||
                        !hasLength(prefix) ||
                        Boolean(prefixError) ||
                        fetching
                    }
                    loading={fetching}
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}
