import type { PrivateLinkRow } from 'src/components/admin/Settings/PrivateLinks/PrivateLinksTable';

import { useState } from 'react';

import { Button, Stack, Typography } from '@mui/material';

import { PrivateLinkDialog } from 'src/components/admin/Settings/PrivateLinks/PrivateLinkDialog';
import { PrivateLinkFormDialog } from 'src/components/admin/Settings/PrivateLinks/PrivateLinkFormDialog';
import { PrivateLinksTable } from 'src/components/admin/Settings/PrivateLinks/PrivateLinksTable';
import { RemovePrivateLinkDialog } from 'src/components/admin/Settings/PrivateLinks/RemovePrivateLinkDialog';
import AlertBox from 'src/components/shared/AlertBox';
import ExternalLink from 'src/components/shared/ExternalLink';
import { StandAloneTableTitle } from 'src/components/tables/EntityTable/StandAloneTableTitle';
import { usePrivateLinks } from 'src/hooks/privateLinks/usePrivateLinks';
import { useTenantStore } from 'src/stores/Tenant';
import { PRIVATE_LINK_DOCS_URL } from 'src/utils/private-link-utils';

const DEPLOYMENT_OPTIONS_URL =
    'https://docs.estuary.dev/getting-started/deployment-options/';

// A link is addressed by id, so each dialog shows it as the list has it now:
// a pending link's dialog fills in when the link is provisioned.
type OpenDialog =
    | { type: 'add' }
    | { type: 'view' | 'edit' | 'remove'; id: string }
    | null;

export function PrivateLinks() {
    const tenant = useTenantStore((state) => state.selectedTenant);

    // Remounts on a tenant change, so no dialog outlives its tenant.
    return tenant ? <PrivateLinksSection key={tenant} tenant={tenant} /> : null;
}

function PrivateLinksSection({ tenant }: { tenant: string }) {
    const { dataPlanes, isLoading, isLoaded, error, capabilitiesError } =
        usePrivateLinks(tenant);
    const [dialog, setDialog] = useState<OpenDialog>(null);

    const rows: PrivateLinkRow[] = dataPlanes.flatMap((dataPlane) =>
        dataPlane.links.map((link) => ({ dataPlane, link }))
    );
    const modifiable = dataPlanes.filter(({ canModify }) => canModify);
    // The API returns no links for these, which is not the same as having none.
    const hidden = dataPlanes.filter(({ canView }) => !canView);

    const selected =
        dialog && dialog.type !== 'add'
            ? rows.find(({ link }) => link.id === dialog.id)
            : undefined;

    return (
        <>
            <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: 'flex-end', justifyContent: 'space-between' }}
            >
                <StandAloneTableTitle
                    title="Private Networking"
                    docsUrl={PRIVATE_LINK_DOCS_URL}
                    message="Private links let a private data plane reach systems in your own network over AWS PrivateLink, Azure Private Link or GCP Private Service Connect."
                />

                {modifiable.length > 0 ? (
                    <Button
                        variant="outlined"
                        onClick={() => setDialog({ type: 'add' })}
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        Add private link
                    </Button>
                ) : null}
            </Stack>

            <Stack spacing={2} sx={{ mt: 2, mb: 2 }}>
                {capabilitiesError && dataPlanes.length > 0 ? (
                    <AlertBox short severity="warning">
                        Your permissions couldn&apos;t be checked, so private
                        links can only be viewed. Reload the page to try again.
                    </AlertBox>
                ) : null}

                {error && isLoaded ? (
                    <AlertBox short severity="warning">
                        Private links couldn&apos;t be refreshed, so this list
                        may be out of date.
                    </AlertBox>
                ) : null}

                {error && !isLoaded ? (
                    <AlertBox
                        short
                        severity="error"
                        title="Private links couldn't be loaded"
                    >
                        {error.graphQLErrors[0]?.message ??
                            'Reload the page to try again.'}
                    </AlertBox>
                ) : isLoading || rows.length > 0 ? (
                    <PrivateLinksTable
                        rows={rows}
                        loading={isLoading}
                        onOpen={({ link }) =>
                            setDialog({ type: 'view', id: link.id })
                        }
                    />
                ) : dataPlanes.length === 0 ? (
                    <Typography sx={{ color: 'text.secondary' }}>
                        Private links are set up on private and BYOC data
                        planes, and {tenant} has none.{' '}
                        <ExternalLink link={DEPLOYMENT_OPTIONS_URL}>
                            Deployment options
                        </ExternalLink>
                    </Typography>
                ) : hidden.length < dataPlanes.length ? (
                    <Typography sx={{ color: 'text.secondary' }}>
                        {modifiable.length > 0
                            ? 'No private links yet.'
                            : `No private links yet. Someone who can manage networking for ${tenant} data planes can add one.`}
                    </Typography>
                ) : null}

                {hidden.length > 0 ? (
                    <Typography sx={{ color: 'text.secondary' }}>
                        You don&apos;t have permission to view the private links
                        on{' '}
                        {hidden
                            .map(({ displayName }) => displayName)
                            .join(', ')}
                        .
                    </Typography>
                ) : null}
            </Stack>

            {dialog?.type === 'add' && modifiable.length > 0 ? (
                <PrivateLinkFormDialog
                    dataPlanes={modifiable}
                    onClose={() => setDialog(null)}
                    onSaved={(id) => setDialog({ type: 'view', id })}
                />
            ) : null}

            {selected && dialog?.type === 'view' ? (
                <PrivateLinkDialog
                    {...selected}
                    onClose={() => setDialog(null)}
                    onEdit={() =>
                        setDialog({ type: 'edit', id: selected.link.id })
                    }
                    onRemove={() =>
                        setDialog({ type: 'remove', id: selected.link.id })
                    }
                />
            ) : null}

            {selected && dialog?.type === 'edit' ? (
                <PrivateLinkFormDialog
                    dataPlanes={modifiable}
                    editing={selected}
                    onClose={() =>
                        setDialog({ type: 'view', id: selected.link.id })
                    }
                    onSaved={(id) => setDialog({ type: 'view', id })}
                />
            ) : null}

            {selected && dialog?.type === 'remove' ? (
                <RemovePrivateLinkDialog
                    {...selected}
                    onClose={() =>
                        setDialog({ type: 'view', id: selected.link.id })
                    }
                    onRemoved={() => setDialog(null)}
                />
            ) : null}
        </>
    );
}
