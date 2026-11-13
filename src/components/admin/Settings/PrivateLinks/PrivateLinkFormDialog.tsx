import type { FormEvent } from 'react';
import type { PrivateLinkDataPlane } from 'src/hooks/privateLinks/usePrivateLinks';
import type {
    PrivateLink,
    PrivateLinkFormField,
} from 'src/utils/private-link-utils';

import { useState } from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import { pick } from 'lodash';
import { useMutation } from 'urql';

import {
    ADD_PRIVATE_LINK,
    UPDATE_PRIVATE_LINK,
} from 'src/api/gql/privateLinks';
import { PrivateLinkFields } from 'src/components/admin/Settings/PrivateLinks/PrivateLinkFields';
import AlertBox from 'src/components/shared/AlertBox';
import ExternalLink from 'src/components/shared/ExternalLink';
import {
    getConfigInput,
    getEmptyForm,
    getFormFromConfig,
    getLinkRegion,
    getLinkService,
    isConfigChanged,
    PRIVATE_LINK_LABELS,
    PRIVATE_LINK_PROVIDER_DOCS,
    validateForm,
} from 'src/utils/private-link-utils';

interface PrivateLinkFormDialogProps {
    // The data planes a link can be added to.
    dataPlanes: PrivateLinkDataPlane[];
    // The link to edit. Absent to add one.
    editing?: { dataPlane: PrivateLinkDataPlane; link: PrivateLink };
    onClose: () => void;
    onSaved: (linkId: string) => void;
}

// What the user has to have set up in their own cloud before adding a link.
const prerequisites = {
    AWS: 'Create a VPC endpoint service for the system you want to reach, and allow this data plane to connect to it.',
    AZURE: 'Create a Private Link service for the system you want to reach, or use an Azure resource that supports Private Link.',
    GCP: 'Publish the system you want to reach with Private Service Connect, and allow this data plane to connect to it.',
};

// Mounted while open, so every opening starts from the link as it is now.
export function PrivateLinkFormDialog({
    dataPlanes,
    editing,
    onClose,
    onSaved,
}: PrivateLinkFormDialogProps) {
    const [, addLink] = useMutation(ADD_PRIVATE_LINK);
    const [, updateLink] = useMutation(UPDATE_PRIVATE_LINK);

    const [dataPlaneName, setDataPlaneName] = useState(
        (editing?.dataPlane ?? dataPlanes[0]).name
    );
    const dataPlane =
        editing?.dataPlane ??
        dataPlanes.find(({ name }) => name === dataPlaneName) ??
        dataPlanes[0];
    const provider = dataPlane.cloudProvider;

    const [form, setForm] = useState(() =>
        editing
            ? getFormFromConfig(editing.link.config)
            : getEmptyForm(provider)
    );
    const [touched, setTouched] = useState<PrivateLinkFormField[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const region = editing
        ? getLinkRegion(editing.link.config)
        : dataPlane.region;

    const errors = validateForm(form, {
        region,
        serviceLocked: Boolean(editing),
        otherServices: dataPlane.links.map(({ config }) =>
            getLinkService(config)
        ),
    });
    // A field shows its error once the user has left it, or tried to save.
    const shownErrors = submitted ? errors : pick(errors, touched);

    const selectDataPlane = (name: string) => {
        const selected = dataPlanes.find((option) => option.name === name);
        setDataPlaneName(name);
        // Each provider has its own fields. Within one, keep what was typed.
        if (selected && selected.cloudProvider !== form.provider) {
            setForm(getEmptyForm(selected.cloudProvider));
            setTouched([]);
            setSubmitted(false);
        }
    };

    const save = async (event: FormEvent) => {
        event.preventDefault();
        setSubmitted(true);
        setSaveError(null);

        if (Object.keys(errors).length > 0) {
            return;
        }
        // Saving an unchanged config leaves the link as it is, so skip it.
        if (editing && !isConfigChanged(form, editing.link.config)) {
            onClose();
            return;
        }

        // Saving disables the button, so a second click can't save twice.
        setSaving(true);
        try {
            const config = getConfigInput(form, region, editing?.link.config);
            const result = editing
                ? await updateLink({ id: editing.link.id, config })
                : await addLink({ dataPlaneName: dataPlane.name, config });

            if (result.error || !result.data) {
                setSaveError(
                    result.error?.graphQLErrors[0]?.message ??
                        'Your entries are still here. Try again in a moment.'
                );
                return;
            }

            onSaved(
                'addDataPlanePrivateLink' in result.data
                    ? result.data.addDataPlanePrivateLink.id
                    : result.data.updateDataPlanePrivateLink.id
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        // No onClose: Escape or a click outside would discard what was entered, so only Cancel closes it.
        <Dialog
            open
            maxWidth="sm"
            fullWidth
            slotProps={{ paper: { component: 'form', onSubmit: save } }}
        >
            <DialogTitle component="div">
                <Typography variant="h6" component="h2">
                    {editing ? 'Edit private link' : 'Add private link'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {PRIVATE_LINK_LABELS[provider]} for {dataPlane.displayName}
                </Typography>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ pt: 1 }}>
                    {saveError ? (
                        <AlertBox
                            short
                            severity="error"
                            title="Couldn't save private link"
                        >
                            {saveError}
                        </AlertBox>
                    ) : null}

                    {editing?.link.status === 'PROVISIONED' ? (
                        <AlertBox short severity="info">
                            Saving a change sets this link up again. It is
                            pending, and its connection details are hidden,
                            until the data plane has applied the change.
                        </AlertBox>
                    ) : null}

                    {editing ? null : (
                        <Typography>
                            {prerequisites[provider]}{' '}
                            <ExternalLink
                                link={PRIVATE_LINK_PROVIDER_DOCS[provider]}
                            >
                                Setup guide
                            </ExternalLink>
                        </Typography>
                    )}

                    {!editing && dataPlanes.length > 1 ? (
                        <TextField
                            select
                            fullWidth
                            label="Data plane"
                            value={dataPlane.name}
                            disabled={saving}
                            onChange={(event) =>
                                selectDataPlane(event.target.value)
                            }
                            slotProps={{ inputLabel: { shrink: true } }}
                        >
                            {dataPlanes.map((option) => (
                                <MenuItem key={option.name} value={option.name}>
                                    {option.displayName}
                                </MenuItem>
                            ))}
                        </TextField>
                    ) : null}

                    <PrivateLinkFields
                        form={form}
                        errors={shownErrors}
                        region={region}
                        serviceLocked={Boolean(editing)}
                        disabled={saving}
                        onChange={setForm}
                        onBlur={(field) =>
                            setTouched((fields) => [...fields, field])
                        }
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button variant="text" onClick={onClose} disabled={saving}>
                    Cancel
                </Button>
                <Button type="submit" loading={saving} loadingPosition="start">
                    {saving
                        ? 'Saving…'
                        : editing
                          ? 'Save changes'
                          : 'Add private link'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
