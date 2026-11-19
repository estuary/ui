import type { ReactNode } from 'react';
import type { PrivateLinkDataPlane } from 'src/components/admin/Settings/PrivateLinks/PrivateDataPlane';

import { useState } from 'react';

import { Button, Pagination, Paper, Stack, Typography } from '@mui/material';

import { Lock, OpenNewWindow } from 'iconoir-react';

import { PRIVATE_LINKS_QUERY } from 'src/api/gql/privateLinks';
import { usePollingQuery } from 'src/api/gql/usePollingQuery';
import { DeletePrivateLinkDialog } from 'src/components/admin/Settings/PrivateLinks/DeletePrivateLinkDialog';
import { EmptyState } from 'src/components/admin/Settings/PrivateLinks/EmptyState';
import { PrivateDataPlane } from 'src/components/admin/Settings/PrivateLinks/PrivateDataPlane';
import { PrivateLinkDialog } from 'src/components/admin/Settings/PrivateLinks/PrivateLinkDialog';
import { PrivateLinkFormDialog } from 'src/components/admin/Settings/PrivateLinks/PrivateLinkFormDialog';
import {
    PRIVATE_LINKS_PAGE_SIZE,
    PrivateLinksTable,
} from 'src/components/admin/Settings/PrivateLinks/PrivateLinksTable';
import ExternalLink from 'src/components/shared/ExternalLink';
import DataPlaneDialog from 'src/components/tables/DataPlanes/DataPlaneDialog';
import { paperBackground } from 'src/context/Theme';
import { useCapabilities } from 'src/hooks/useCapabilities';
import { DATA_PLANE_SETTINGS } from 'src/settings/dataPlanes';
import { toPresentableName } from 'src/utils/dataPlane-utils';
import {
    PRIVATE_LINK_DOCS_URL,
    PRIVATE_LINK_PROVIDERS,
} from 'src/utils/private-link-utils';

const TITLE_ID = 'private-data-planes-title';
const PRIVATE_DEPLOYMENTS_DOCS_URL = 'https://docs.estuary.dev/private-byoc/';
const CONTACT_URL = 'https://estuary.dev/contact-us';

type OpenDialog =
    | { type: 'add' | 'plane'; name: string }
    | { type: 'view' | 'edit' | 'delete'; id: string }
    | null;

export function PrivateLinks({ tenant }: { tenant: string }) {
    const [dialog, setDialog] = useState<OpenDialog>(null);
    // With multiple planes, undefined uses the default and null collapses all.
    const [expanded, setExpanded] = useState<string | null>();
    const [planePage, setPlanePage] = useState(1);
    const [linkPage, setLinkPage] = useState(1);

    // Pause polling so a failed refresh cannot discard an open form.
    const { data, fetching } = usePollingQuery({
        query: PRIVATE_LINKS_QUERY,
        variables: { tenant },
        pollingIntervalMs: 15000,
        pause: dialog?.type === 'add' || dialog?.type === 'edit',
    });
    const { capabilities } = useCapabilities(
        `${DATA_PLANE_SETTINGS.private.prefix}${tenant}`
    );
    // While capabilities are unknown the actions are offered and the API decides.
    const canModify =
        capabilities?.includes('ModifyDataPlanePrivateNetworking') ?? true;

    if (!data) {
        return fetching ? (
            <Section>
                <Typography
                    component="output"
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: 'block' }}
                >
                    Loading private data planes…
                </Typography>
            </Section>
        ) : null;
    }

    const dataPlanes: PrivateLinkDataPlane[] = data.dataPlanes.edges.map(
        ({ node }) => ({
            ...node,
            displayName: toPresentableName({
                name: node.name,
                scope: 'private',
            }),
            scope: 'private',
        })
    );
    if (dataPlanes.length === 0) {
        return (
            <Section>
                <Paper
                    variant="outlined"
                    sx={{
                        bgcolor: (theme) => paperBackground[theme.palette.mode],
                    }}
                >
                    <EmptyState
                        icon={<Lock aria-hidden />}
                        title={`No private data planes for ${tenant}`}
                        actions={
                            <>
                                <Button
                                    variant="outlined"
                                    href={PRIVATE_DEPLOYMENTS_DOCS_URL}
                                    target="_blank"
                                    rel="noopener"
                                    startIcon={
                                        <OpenNewWindow
                                            width={15}
                                            height={15}
                                            aria-hidden
                                        />
                                    }
                                >
                                    Learn about private deployments
                                </Button>
                                <Button
                                    href={CONTACT_URL}
                                    target="_blank"
                                    rel="noopener"
                                >
                                    Contact us
                                </Button>
                            </>
                        }
                    >
                        Private links are set up on a private data plane, and
                        this prefix doesn&apos;t have one. Private data planes
                        come with a private deployment or BYOC.
                    </EmptyState>
                </Paper>
            </Section>
        );
    }

    const multiple = dataPlanes.length > 1;
    const openPlaneName =
        !multiple ||
        (expanded === undefined && dataPlanes.length <= PRIVATE_LINKS_PAGE_SIZE)
            ? dataPlanes[0].name
            : expanded;
    const currentPlanePage = Math.min(planePage, pageCount(dataPlanes.length));
    const planeOffset = (currentPlanePage - 1) * PRIVATE_LINKS_PAGE_SIZE;
    const links =
        dataPlanes.find(({ name }) => name === openPlaneName)?.privateLinks ??
        [];
    const currentLinkPage = Math.min(linkPage, pageCount(links.length));

    const selectedLink =
        dialog && 'id' in dialog ? findLink(dataPlanes, dialog.id) : undefined;
    const selectedPlane =
        dialog && 'name' in dialog
            ? dataPlanes.find(({ name }) => name === dialog.name)
            : undefined;
    const close = () => setDialog(null);
    const view = (id: string) => setDialog({ type: 'view', id });

    const linkTable =
        links.length > 0 ? (
            <>
                <PrivateLinksTable
                    links={links}
                    page={currentLinkPage}
                    onOpen={view}
                />
                <ListPagination
                    label="private links"
                    total={links.length}
                    page={currentLinkPage}
                    onChange={setLinkPage}
                />
            </>
        ) : null;

    return (
        <Section
            beside={
                <ExternalLink link={PRIVATE_LINK_DOCS_URL} sx={{ ml: 0 }}>
                    Private link guide
                </ExternalLink>
            }
        >
            <Paper
                variant="outlined"
                sx={{
                    bgcolor: (theme) => paperBackground[theme.palette.mode],
                    overflow: 'clip',
                }}
            >
                <ListPagination
                    label="data planes"
                    total={dataPlanes.length}
                    page={currentPlanePage}
                    onChange={setPlanePage}
                />
                {dataPlanes
                    .slice(planeOffset, planeOffset + PRIVATE_LINKS_PAGE_SIZE)
                    .map((plane) => {
                        const open = plane.name === openPlaneName;

                        return (
                            <PrivateDataPlane
                                key={plane.name}
                                plane={plane}
                                open={open}
                                compact={
                                    open
                                        ? false
                                        : dataPlanes.length >
                                          PRIVATE_LINKS_PAGE_SIZE
                                }
                                onToggle={
                                    multiple
                                        ? () => {
                                              setExpanded(
                                                  open ? null : plane.name
                                              );
                                              setLinkPage(1);
                                          }
                                        : undefined
                                }
                                onDetails={() =>
                                    setDialog({
                                        type: 'plane',
                                        name: plane.name,
                                    })
                                }
                                onAdd={
                                    canModify && plane.cloudProvider !== 'LOCAL'
                                        ? () =>
                                              setDialog({
                                                  type: 'add',
                                                  name: plane.name,
                                              })
                                        : undefined
                                }
                            >
                                {open ? linkTable : null}
                            </PrivateDataPlane>
                        );
                    })}
            </Paper>

            {selectedPlane && dialog?.type === 'plane' ? (
                <DataPlaneDialog dataPlane={selectedPlane} onClose={close} />
            ) : null}
            {selectedPlane &&
            selectedPlane.cloudProvider !== 'LOCAL' &&
            dialog?.type === 'add' ? (
                <PrivateLinkFormDialog
                    dataPlane={selectedPlane}
                    provider={selectedPlane.cloudProvider}
                    onClose={close}
                    onSaved={view}
                />
            ) : null}
            {selectedLink && dialog?.type === 'view' ? (
                <PrivateLinkDialog
                    planeDisplayName={selectedLink.dataPlane.displayName}
                    link={selectedLink.link}
                    canModify={canModify}
                    onClose={close}
                    onEdit={() =>
                        setDialog({ type: 'edit', id: selectedLink.link.id })
                    }
                    onDelete={() =>
                        setDialog({ type: 'delete', id: selectedLink.link.id })
                    }
                />
            ) : null}
            {selectedLink && dialog?.type === 'edit' ? (
                <PrivateLinkFormDialog
                    dataPlane={selectedLink.dataPlane}
                    provider={
                        PRIVATE_LINK_PROVIDERS[
                            selectedLink.link.config.__typename
                        ]
                    }
                    editing={selectedLink.link}
                    onClose={() => view(selectedLink.link.id)}
                    onSaved={view}
                />
            ) : null}
            {selectedLink && dialog?.type === 'delete' ? (
                <DeletePrivateLinkDialog
                    planeDisplayName={selectedLink.dataPlane.displayName}
                    link={selectedLink.link}
                    onClose={() => view(selectedLink.link.id)}
                    onDeleted={close}
                />
            ) : null}
        </Section>
    );
}

function findLink(dataPlanes: PrivateLinkDataPlane[], id: string) {
    for (const dataPlane of dataPlanes) {
        const link = dataPlane.privateLinks.find((link) => link.id === id);
        if (link) {
            return { dataPlane, link };
        }
    }
    return undefined;
}

function pageCount(total: number) {
    return Math.max(1, Math.ceil(total / PRIVATE_LINKS_PAGE_SIZE));
}

function ListPagination({
    label,
    total,
    page,
    onChange,
}: {
    label: string;
    total: number;
    page: number;
    onChange: (page: number) => void;
}) {
    const pages = pageCount(total);

    if (pages <= 1) {
        return null;
    }

    const start = (page - 1) * PRIVATE_LINKS_PAGE_SIZE;

    return (
        <Stack
            direction="row"
            useFlexGap
            spacing={1}
            sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                px: 1.5,
                py: 0.75,
                bgcolor: 'action.hover',
            }}
        >
            <Typography variant="caption" color="text.secondary">
                {start + 1}–{Math.min(start + PRIVATE_LINKS_PAGE_SIZE, total)}{' '}
                of {total} {label}
            </Typography>
            <Pagination
                aria-label={`${label} pagination`}
                size="small"
                count={pages}
                page={page}
                onChange={(_event, nextPage) => onChange(nextPage)}
            />
        </Stack>
    );
}

function Section({
    beside,
    children,
}: {
    beside?: ReactNode;
    children: ReactNode;
}) {
    return (
        <Stack component="section" aria-labelledby={TITLE_ID} spacing={1}>
            <Stack
                direction="row"
                useFlexGap
                spacing={1}
                sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}
            >
                <Typography
                    id={TITLE_ID}
                    component="h3"
                    variant="subtitle1"
                    fontWeight={600}
                >
                    Private data planes
                </Typography>
                {beside}
            </Stack>
            {children}
        </Stack>
    );
}
