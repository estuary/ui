import type { FormEvent } from 'react';
import type { PrivateLinkDataPlane } from 'src/components/admin/Settings/PrivateLinks/PrivateDataPlane';
import type { CloudProvider } from 'src/utils/cloudRegions';
import type { PrivateLink } from 'src/utils/private-link-utils';

import { useState } from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';

import { isEqual } from 'lodash';
import { useMutation } from 'urql';

import {
    ADD_PRIVATE_LINK,
    UPDATE_PRIVATE_LINK,
} from 'src/api/gql/privateLinks';
import { PrivateLinkFormFields } from 'src/components/admin/Settings/PrivateLinks/PrivateLinkFormFields';
import AlertBox from 'src/components/shared/AlertBox';
import ExternalLink from 'src/components/shared/ExternalLink';
import { normalizeError } from 'src/utils/errors';
import {
    getConfigInput,
    getInitialForm,
    getLinkRegion,
    PRIVATE_LINK_PROVIDER_DOCS,
    validateForm,
} from 'src/utils/private-link-utils';

interface PrivateLinkFormDialogProps {
    dataPlane: PrivateLinkDataPlane;
    target: CloudProvider | PrivateLink;
    onClose: () => void;
    onSaved: (linkId: string) => void;
}

const PRIVATE_LINK_LABELS: Record<CloudProvider, string> = {
    AWS: 'AWS PrivateLink',
    AZURE: 'Azure Private Link',
    GCP: 'GCP Private Service Connect',
};

// Mount on open so each edit starts from the current link configuration.
export function PrivateLinkFormDialog({
    dataPlane,
    target,
    onClose,
    onSaved,
}: PrivateLinkFormDialogProps) {
    const [{ fetching: adding }, addLink] = useMutation(ADD_PRIVATE_LINK);
    const [{ fetching: updating }, updateLink] =
        useMutation(UPDATE_PRIVATE_LINK);
    const saving = adding || updating;

    const editing = typeof target === 'object';
    const [initialForm] = useState(() =>
        getInitialForm(editing ? target.config : target)
    );
    const { provider } = initialForm;
    const [form, setForm] = useState(initialForm);
    const [submitted, setSubmitted] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const region = editing ? getLinkRegion(target.config) : dataPlane.region;

    const errors = validateForm(form);
    const shownErrors = submitted ? errors : {};

    const save = async (event: FormEvent) => {
        event.preventDefault();
        setSubmitted(true);
        setSaveError(null);

        if (Object.keys(errors).length > 0) {
            return;
        }

        const config = getConfigInput(
            form,
            region,
            editing ? target.config : undefined
        );
        const result = editing
            ? await updateLink({ id: target.id, config })
            : await addLink({ dataPlaneName: dataPlane.name, config });

        if (result.error || !result.data) {
            const errorMessage =
                result.error && normalizeError(result.error)?.message;
            setSaveError(
                errorMessage || 'The request did not complete. Try again.'
            );
            return;
        }

        onSaved(
            'addDataPlanePrivateLink' in result.data
                ? result.data.addDataPlanePrivateLink.id
                : result.data.updateDataPlanePrivateLink.id
        );
    };

    return (
        // Escape and backdrop clicks may dismiss only an idle, unchanged form.
        <Dialog
            open
            onClose={
                !saving && isEqual(form, initialForm) ? onClose : undefined
            }
            maxWidth="sm"
            fullWidth
            aria-labelledby="private-link-form-title"
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
                        <AlertBox short severity="error" title="Request failed">
                            {saveError}
                        </AlertBox>
                    ) : null}

                    {editing && target.status === 'PROVISIONED' ? (
                        <AlertBox short severity="info">
                            Saving a change sets this link up again. It shows as
                            Setting up, and its endpoint address is hidden,
                            until the data plane has applied the change.
                        </AlertBox>
                    ) : null}

                    {editing ? null : (
                        <Typography>
                            <ExternalLink
                                link={PRIVATE_LINK_PROVIDER_DOCS[provider]}
                            >
                                Setup guide
                            </ExternalLink>
                        </Typography>
                    )}

                    <PrivateLinkFormFields
                        form={form}
                        errors={shownErrors}
                        region={region}
                        serviceLocked={editing}
                        disabled={saving}
                        onChange={setForm}
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
