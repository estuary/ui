import { useEffect, useState } from 'react';

import {
    Box,
    Button,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';

import { useCopilotAction, useHumanInTheLoop } from '@copilotkit/react-core';
import { useClient } from 'urql';

import { CONNECTOR_TAG_QUERY, CONNECTORS_QUERY } from 'src/api/gql/connectors';
import { getDataPlaneOptions } from 'src/api/dataPlanes';
import { createEntityDraft } from 'src/api/drafts';
import { discover } from 'src/api/discovers';
import { encryptConfig } from 'src/api/oauth';
import { createPublication } from 'src/api/publications';
import { supabaseClient } from 'src/context/GlobalProviders';
import { JOB_STATUS_COLUMNS, TABLES } from 'src/services/supabase';
import {
    clearCapturedConnectorConfig,
    getCapturedConnectorConfig,
    setCapturedConnectorConfig,
} from 'src/stores/Copilot/connectorConfig';
import { useEntitiesStore } from 'src/stores/Entities/Store';
import { getDataPlaneInfo } from 'src/utils/dataPlane-utils';
import { defaultDataPlaneSuffix } from 'src/utils/env-utils';
import { checkIfPublishIsDone } from 'src/utils/publication-utils';

const errorMessage = (error: unknown) =>
    error instanceof Error ? error.message : String(error);

const delay = (ms: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

// Polls a job-bearing table (discovers / publications) until its job_status
// leaves "queued", reusing the app's checkIfPublishIsDone semantics.
async function pollJob(
    table: string,
    id: string,
    { tries = 80, intervalMs = 1500 }: { tries?: number; intervalMs?: number } = {}
): Promise<{ success: boolean; row: any; timedOut?: boolean }> {
    for (let attempt = 0; attempt < tries; attempt += 1) {
        const payload = await supabaseClient
            .from(table)
            .select(JOB_STATUS_COLUMNS)
            .eq('id', id);

        const [done, row] = checkIfPublishIsDone(payload);
        if (done !== null) {
            return { success: done, row };
        }

        await delay(intervalMs);
    }

    return { success: false, row: null, timedOut: true };
}

// Discovery and publication need a data plane, and it must be one the catalog
// prefix's storage mapping permits (the same source the create form uses) —
// otherwise the publish build fails with a storage-mapping error. Fall back to
// the default-suffix data plane only if no storage mapping matches.
async function resolveDataPlaneName(
    catalogName: string
): Promise<string | undefined> {
    try {
        const { storageMappings } = useEntitiesStore.getState();
        const { dataPlaneNames } = getDataPlaneInfo(storageMappings, catalogName);
        if (dataPlaneNames.length > 0) {
            return dataPlaneNames[0];
        }

        const response = await getDataPlaneOptions();
        const rows =
            (
                response as {
                    data?: Array<{ data_plane_name?: string }> | null;
                }
            ).data ?? [];
        const preferred = rows.find((row) =>
            row.data_plane_name?.endsWith(defaultDataPlaneSuffix)
        );
        return (preferred ?? rows[0])?.data_plane_name;
    } catch {
        return undefined;
    }
}

// Heuristic: which schema properties hold secrets (rendered as password inputs).
const isSecretField = (prop: any): boolean =>
    Boolean(
        prop?.secret ||
            prop?.airbyte_secret ||
            prop?.writeOnly ||
            prop?.['x-secret'] ||
            (typeof prop?.format === 'string' &&
                prop.format.toLowerCase().includes('password'))
    );

interface ConfigField {
    key: string;
    label: string;
    description?: string;
    secret: boolean;
    required: boolean;
    isNumber: boolean;
}

// Renders the connector's endpoint-config form inside the chat card. The values
// it collects are written to the local (LLM-invisible) config store; only an
// acknowledgement of which fields were filled is sent back to the agent.
function ConnectorConfigForm({
    imageName,
    imageTag,
    connectorTitle,
    status,
    respond,
}: {
    imageName: string;
    imageTag: string;
    connectorTitle: string;
    status: string;
    respond?: (result: string) => void;
}) {
    const theme = useTheme();
    const client = useClient();

    const [fields, setFields] = useState<ConfigField[] | null>(null);
    const [values, setValues] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    // Fetch the connector's endpoint schema once and derive the form fields.
    useEffect(() => {
        let cancelled = false;
        client
            .query(CONNECTOR_TAG_QUERY, {
                imageName,
                fullImageName: `${imageName}${imageTag}`,
            })
            .toPromise()
            .then((result) => {
                if (cancelled) {
                    return;
                }
                const schema: any = result.data?.connectorSpec?.endpointSpecSchema;
                const properties = schema?.properties ?? {};
                const required: string[] = schema?.required ?? [];
                const derived: ConfigField[] = Object.entries(properties)
                    .filter(([, prop]: [string, any]) =>
                        ['string', 'integer', 'number'].includes(prop?.type)
                    )
                    .map(([key, prop]: [string, any]) => ({
                        key,
                        label: prop.title ?? key,
                        description: prop.description,
                        secret: isSecretField(prop),
                        required: required.includes(key),
                        isNumber:
                            prop.type === 'integer' || prop.type === 'number',
                    }));
                setFields(derived);
                setLoading(false);
            })
            .catch(() => {
                if (!cancelled) {
                    setFields([]);
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageName, imageTag]);

    const submit = () => {
        const coerced: Record<string, unknown> = {};
        (fields ?? []).forEach((field) => {
            const raw = values[field.key];
            if (raw === undefined || raw === '') {
                return;
            }
            coerced[field.key] = field.isNumber ? Number(raw) : raw;
        });

        // Values go to local state only — never into the respond() payload.
        setCapturedConnectorConfig(coerced);
        setSubmitted(true);
        respond?.(
            `Configuration captured for ${connectorTitle}. Fields provided: ${
                Object.keys(coerced).join(', ') || '(none required)'
            }.`
        );
    };

    if (status === 'complete' || submitted) {
        return (
            <Box
                sx={{
                    p: 1.5,
                    my: 1,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Typography variant="body2">
                    ✓ {connectorTitle} configuration captured (kept local — not
                    shared with the assistant).
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                p: 2,
                my: 1,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                background: theme.palette.background.default,
            }}
        >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Configure {connectorTitle}
            </Typography>

            {loading ? (
                <Typography variant="body2">Loading config fields…</Typography>
            ) : (
                <Stack spacing={1.5}>
                    {(fields ?? []).length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            This connector needs no configuration.
                        </Typography>
                    ) : (
                        (fields ?? []).map((field) => (
                            <TextField
                                key={field.key}
                                size="small"
                                fullWidth
                                type={field.secret ? 'password' : 'text'}
                                label={`${field.label}${
                                    field.required ? ' *' : ''
                                }`}
                                helperText={field.description}
                                value={values[field.key] ?? ''}
                                onChange={(event) =>
                                    setValues((prev) => ({
                                        ...prev,
                                        [field.key]: event.target.value,
                                    }))
                                }
                            />
                        ))
                    )}

                    <Button variant="contained" size="small" onClick={submit}>
                        Save configuration
                    </Button>
                </Stack>
            )}
        </Box>
    );
}

// Registers the "New Dataflow" capture-creation actions. Must render inside the
// <CopilotKit> provider (and within UrqlConfigProvider, for useClient()).
export default function DataflowActions() {
    const client = useClient();

    useCopilotAction({
        name: 'findConnectors',
        description:
            'Search Estuary connectors by name to find the one matching a source the user described. Returns matches with title and the identifiers needed to configure and create the task.',
        parameters: [
            {
                name: 'query',
                type: 'string',
                description:
                    'Search text, e.g. "postgres", "hello world", "snowflake".',
                required: true,
            },
            {
                name: 'kind',
                type: 'string',
                description:
                    '"capture" for a source (default) or "materialization" for a destination.',
                required: false,
            },
        ],
        handler: async ({ query, kind }) => {
            // eslint-disable-next-line no-console
            console.log('[copilot] findConnectors', query, kind);
            try {
                const result = await client
                    .query(CONNECTORS_QUERY, {})
                    .toPromise();
                const protocol =
                    kind === 'materialization' ? 'materialization' : 'capture';
                const needle = query.toLowerCase();

                const nodes = (result.data?.connectors?.edges ?? []).map(
                    (edge) => edge.node
                );
                const matchesText = (node: any) =>
                    (node.title ?? '').toLowerCase().includes(needle) ||
                    (node.imageName ?? '').toLowerCase().includes(needle);

                let matches = nodes
                    .filter(
                        (node) =>
                            node.defaultSpec?.protocol === protocol &&
                            matchesText(node)
                    )
                    .slice(0, 6);

                // Fall back to a name match across protocols if nothing matched.
                if (matches.length === 0) {
                    matches = nodes.filter(matchesText).slice(0, 6);
                }

                return {
                    matches: matches.map((node) => ({
                        title: node.title,
                        imageName: node.imageName,
                        imageTag: node.defaultSpec?.imageTag,
                        protocol: node.defaultSpec?.protocol,
                        connectorId: node.id,
                        connectorTagId: node.defaultSpec?.id,
                        documentationUrl: node.defaultSpec?.documentationUrl,
                    })),
                };
            } catch (error) {
                return { error: errorMessage(error) };
            }
        },
    });

    useHumanInTheLoop({
        name: 'collectConnectorConfig',
        description:
            "Show the user a form to enter the connector's configuration and credentials. Call this after a connector is chosen, passing its imageName and imageTag. The values are captured locally and are NOT shared with you — you only receive a confirmation of which fields were filled.",
        parameters: [
            {
                name: 'connectorTitle',
                type: 'string',
                description: 'Connector title, shown as the form header.',
                required: true,
            },
            {
                name: 'imageName',
                type: 'string',
                description: 'Connector imageName from findConnectors.',
                required: true,
            },
            {
                name: 'imageTag',
                type: 'string',
                description: 'Connector imageTag from findConnectors.',
                required: true,
            },
        ],
        render: ({ status, args, respond }: any) => (
            <ConnectorConfigForm
                connectorTitle={args?.connectorTitle ?? 'connector'}
                imageName={args?.imageName ?? ''}
                imageTag={args?.imageTag ?? ''}
                status={status}
                respond={respond}
            />
        ),
    });

    useCopilotAction({
        name: 'createCaptureDraft',
        description:
            'Create a draft capture from the previously collected config and run discovery to find the collections it will produce. Call only after collectConnectorConfig has captured the config. Returns the draftId and the discovered collections.',
        parameters: [
            {
                name: 'captureName',
                type: 'string',
                description:
                    'Full catalog name for the new capture, e.g. "gco/my-source".',
                required: true,
            },
            {
                name: 'connectorId',
                type: 'string',
                description: 'connectorId from findConnectors.',
                required: true,
            },
            {
                name: 'connectorTagId',
                type: 'string',
                description: 'connectorTagId from findConnectors.',
                required: true,
            },
        ],
        handler: async ({ captureName, connectorId, connectorTagId }) => {
            // eslint-disable-next-line no-console
            console.log('[copilot] createCaptureDraft', captureName);
            try {
                const config = getCapturedConnectorConfig();

                const encrypted = await encryptConfig(
                    connectorId,
                    connectorTagId,
                    config
                );
                if (encrypted.error || encrypted.data?.error) {
                    return {
                        error: 'Failed to encrypt connector config.',
                        detail: encrypted.error ?? encrypted.data?.error,
                    };
                }

                const draftResponse = await createEntityDraft(captureName);
                const draftId = draftResponse.data?.[0]?.id;
                if (!draftId) {
                    return { error: 'Failed to create draft.' };
                }

                const dataPlaneName = await resolveDataPlaneName(captureName);
                const discoverResponse = await discover(
                    captureName,
                    encrypted.data,
                    connectorTagId,
                    draftId,
                    false,
                    dataPlaneName
                );
                const discoverId = discoverResponse.data?.[0]?.id;
                if (!discoverId) {
                    return {
                        error: 'Failed to start discovery.',
                        detail: discoverResponse.error,
                    };
                }

                const { success, row, timedOut } = await pollJob(
                    TABLES.DISCOVERS,
                    discoverId
                );
                if (!success) {
                    return {
                        error: timedOut
                            ? 'Discovery timed out.'
                            : 'Discovery failed.',
                        jobStatus: row?.job_status,
                        logsToken: row?.logs_token,
                        draftId,
                    };
                }

                const specs = await supabaseClient
                    .from(TABLES.DRAFT_SPECS)
                    .select('catalog_name, spec')
                    .eq('draft_id', draftId)
                    .eq('spec_type', 'capture');

                const spec: any = specs.data?.[0]?.spec;
                const collections = (spec?.bindings ?? [])
                    .map((binding: any) => binding.target)
                    .filter(Boolean);

                return {
                    draftId,
                    captureName,
                    collectionCount: collections.length,
                    collections: collections.slice(0, 25),
                };
            } catch (error) {
                return { error: errorMessage(error) };
            }
        },
    });

    useCopilotAction({
        name: 'publishCapture',
        description:
            'Publish the drafted capture to make it live. Only call after the user has explicitly confirmed they want to publish.',
        parameters: [
            {
                name: 'draftId',
                type: 'string',
                description: 'draftId returned by createCaptureDraft.',
                required: true,
            },
            {
                name: 'captureName',
                type: 'string',
                description: 'The capture catalog name.',
                required: true,
            },
        ],
        handler: async ({ draftId, captureName }) => {
            // eslint-disable-next-line no-console
            console.log('[copilot] publishCapture', captureName);
            try {
                const dataPlaneName = await resolveDataPlaneName(captureName);
                const publishResponse = await createPublication(
                    draftId,
                    false,
                    `Created ${captureName} via the dashboard assistant`,
                    dataPlaneName
                );
                const publicationId = publishResponse.data?.[0]?.id;
                if (!publicationId) {
                    return {
                        error: 'Failed to create publication.',
                        detail: publishResponse.error,
                    };
                }

                const { success, row, timedOut } = await pollJob(
                    TABLES.PUBLICATIONS,
                    publicationId
                );
                clearCapturedConnectorConfig();

                if (!success) {
                    const buildErrors = await supabaseClient
                        .from(TABLES.DRAFT_ERRORS)
                        .select('scope, detail')
                        .eq('draft_id', draftId);
                    return {
                        published: false,
                        error: timedOut
                            ? 'Publish timed out.'
                            : 'Publish failed.',
                        jobStatus: row?.job_status,
                        buildErrors: buildErrors.data,
                        logsToken: row?.logs_token,
                    };
                }

                return { published: true, captureName };
            } catch (error) {
                return { error: errorMessage(error) };
            }
        },
    });

    return null;
}
