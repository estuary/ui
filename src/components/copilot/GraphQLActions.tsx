import type { DocumentNode } from 'graphql';

import { useMemo, useState } from 'react';

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Collapse,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';

import { useCopilotAction, useHumanInTheLoop } from '@copilotkit/react-core';
import { parse } from 'graphql';
import { useClient } from 'urql';

import { redactForModel } from 'src/components/copilot/redactSensitive';

// Cap serialized results so a broad query can't blow the model's context.
const MAX_RESULT_CHARS = 8000;

// Whether the document contains an operation of the given kind.
const hasOperation = (
    doc: DocumentNode,
    operation: 'query' | 'mutation' | 'subscription'
): boolean =>
    doc.definitions.some(
        (definition) =>
            definition.kind === 'OperationDefinition' &&
            definition.operation === operation
    );

// Builds the action's return payload from a urql result, capping size so a
// broad response can't blow the model's context.
const summarizeResult = (result: {
    data?: unknown;
    error?: any;
}): Record<string, unknown> => {
    const errors = result.error
        ? result.error.graphQLErrors?.length
            ? result.error.graphQLErrors.map((e: any) => e.message)
            : [result.error.message]
        : undefined;

    const payload = { data: result.data ?? null, errors };
    const serialized = JSON.stringify(payload);

    if (serialized.length > MAX_RESULT_CHARS) {
        return {
            truncated: true,
            note: `Result exceeded ${MAX_RESULT_CHARS} characters — narrow it (fewer fields, add filters or a smaller first:).`,
            errors,
            preview: serialized.slice(0, MAX_RESULT_CHARS),
        };
    }

    return payload;
};

// Flattens an introspection type ref (NON_NULL / LIST wrappers) into readable
// SDL-ish text, e.g. "[LiveSpec!]!".
const renderTypeRef = (ref: any): string => {
    if (!ref) {
        return 'Unknown';
    }
    if (ref.kind === 'NON_NULL') {
        return `${renderTypeRef(ref.ofType)}!`;
    }
    if (ref.kind === 'LIST') {
        return `[${renderTypeRef(ref.ofType)}]`;
    }
    return ref.name ?? 'Unknown';
};

// Renders an argument / input field as "name: Type = default — description", so
// the agent sees format hints (e.g. "ISO 8601 duration, e.g. P90D") and defaults
// that live in the schema's descriptions, not just the bare type.
const renderArg = (arg: any): string => {
    const base = `${arg.name}: ${renderTypeRef(arg.type)}`;
    const withDefault =
        arg.defaultValue != null ? `${base} = ${arg.defaultValue}` : base;
    return arg.description ? `${withDefault} — ${arg.description}` : withDefault;
};

const DESCRIBE_TYPE_DOC = parse(`
    query DescribeType($name: String!) {
        __type(name: $name) {
            name
            kind
            description
            fields(includeDeprecated: false) {
                name
                description
                args { name description defaultValue type { ...TypeRef } }
                type { ...TypeRef }
            }
            inputFields { name description defaultValue type { ...TypeRef } }
            enumValues(includeDeprecated: false) { name }
            possibleTypes { name }
        }
    }
    fragment TypeRef on __Type {
        kind
        name
        ofType {
            kind
            name
            ofType { kind name ofType { kind name ofType { kind name } } }
        }
    }
`);

// Converts a GraphQL argument value AST node into a plain JS value, resolving
// $variables against the provided variables object.
const valueNodeToJS = (
    node: any,
    variables: Record<string, unknown>
): unknown => {
    switch (node?.kind) {
        case 'IntValue':
        case 'FloatValue':
            return Number(node.value);
        case 'StringValue':
        case 'EnumValue':
            return node.value;
        case 'BooleanValue':
            return node.value;
        case 'NullValue':
            return null;
        case 'ListValue':
            return node.values.map((value: any) =>
                valueNodeToJS(value, variables)
            );
        case 'ObjectValue':
            return Object.fromEntries(
                node.fields.map((field: any) => [
                    field.name.value,
                    valueNodeToJS(field.value, variables),
                ])
            );
        case 'Variable':
            return variables[node.name.value];
        default:
            return null;
    }
};

// Extracts a readable view of a mutation: each top-level operation field and the
// name→value pairs it sets. Returns null if the query can't be parsed (e.g.
// mid-stream) or contains no mutation.
const describeMutation = (
    query: string,
    variables: Record<string, unknown>
): Array<{
    field: string;
    args: Array<{ name: string; value: unknown }>;
}> | null => {
    try {
        const doc: any = parse(query);
        const operations = [];
        for (const definition of doc.definitions) {
            if (
                definition.kind !== 'OperationDefinition' ||
                definition.operation !== 'mutation'
            ) {
                continue;
            }
            for (const selection of definition.selectionSet.selections) {
                if (selection.kind !== 'Field') {
                    continue;
                }
                operations.push({
                    field: selection.name.value,
                    args: (selection.arguments ?? []).map((arg: any) => ({
                        name: arg.name.value,
                        value: valueNodeToJS(arg.value, variables),
                    })),
                });
            }
        }
        return operations.length > 0 ? operations : null;
    } catch {
        return null;
    }
};

// Renders a parsed argument value as readable, indented name: value pairs — the
// middle ground between the prose summary and raw GraphQL.
function ValueView({ value }: { value: unknown }) {
    if (value === null || value === undefined) {
        return (
            <Typography component="span" variant="body2" color="text.secondary">
                —
            </Typography>
        );
    }

    if (Array.isArray(value)) {
        return (
            <Stack spacing={0.5} sx={{ pl: 1.5 }}>
                {value.map((item, index) =>
                    item !== null && typeof item === 'object' ? (
                        <Box
                            key={index}
                            sx={{
                                borderLeft: '2px solid',
                                borderColor: 'divider',
                                pl: 1,
                            }}
                        >
                            <ValueView value={item} />
                        </Box>
                    ) : (
                        <Typography key={index} variant="body2">
                            • {String(item)}
                        </Typography>
                    )
                )}
            </Stack>
        );
    }

    if (typeof value === 'object') {
        return (
            <Stack spacing={0.25} sx={{ pl: 1.5 }}>
                {Object.entries(value as Record<string, unknown>).map(
                    ([key, nested]) => (
                        <Box key={key}>
                            <Typography
                                component="span"
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                            >
                                {key}:
                            </Typography>{' '}
                            {nested !== null && typeof nested === 'object' ? (
                                <ValueView value={nested} />
                            ) : (
                                <Typography component="span" variant="body2">
                                    {String(nested)}
                                </Typography>
                            )}
                        </Box>
                    )
                )}
            </Stack>
        );
    }

    return (
        <Typography component="span" variant="body2">
            {String(value)}
        </Typography>
    );
}

// Human-in-the-loop approval for a proposed GraphQL mutation. Shows the editable
// mutation + variables and only runs it (via the user's URQL client) once the
// user approves — the agent proposes, the user authorizes. Mirrors the
// runSetupSql card.
function MutationApprovalCard({
    summary,
    initialQuery,
    initialVariables,
    status,
    respond,
}: {
    summary: string;
    initialQuery: string;
    initialVariables: string;
    status: string;
    respond?: (result: string) => void;
}) {
    const theme = useTheme();
    const client = useClient();

    // CopilotKit streams the tool args into this render incrementally, so the
    // props arrive across several renders. Track edits separately and fall back
    // to the (latest) prop until the user actually types — seeding useState
    // directly would freeze the fields to the first, empty render.
    const [editedQuery, setEditedQuery] = useState<string | null>(null);
    const [editedVariables, setEditedVariables] = useState<string | null>(null);
    const query = editedQuery ?? initialQuery;
    const variablesText = editedVariables ?? initialVariables;
    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [succeeded, setSucceeded] = useState(false);
    const [resultData, setResultData] = useState<unknown>(null);
    const [copied, setCopied] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    const [failedMessage, setFailedMessage] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    // The readable field→value breakdown of the proposed mutation, recomputed as
    // the query/variables stream in or the user edits them.
    const operations = useMemo(() => {
        let parsedVariables: Record<string, unknown> = {};
        try {
            parsedVariables = variablesText.trim()
                ? JSON.parse(variablesText)
                : {};
        } catch {
            parsedVariables = {};
        }
        return describeMutation(query, parsedVariables);
    }, [query, variablesText]);

    const approve = async () => {
        setRunning(true);
        setError(null);
        try {
            const doc = parse(query);
            if (
                !hasOperation(doc, 'mutation') ||
                hasOperation(doc, 'subscription')
            ) {
                setError('This is not a valid mutation operation.');
                setRunning(false);
                return;
            }

            const variables: Record<string, unknown> = variablesText.trim()
                ? JSON.parse(variablesText)
                : {};

            const result = await client.mutation(doc, variables).toPromise();
            if (result.error) {
                const message = result.error.graphQLErrors.length
                    ? result.error.graphQLErrors
                          .map((e) => e.message)
                          .join('; ')
                    : result.error.message;
                setFailedMessage(message);
                // Pipe the failure back to the agent so it can correct the
                // mutation and propose a fixed version (a fresh approval card),
                // rather than leaving the user stuck on a dead card.
                respond?.(
                    `The user approved, but the mutation failed: ${message}. Correct the mutation (e.g. fix an argument value or its format) and propose it again with runGraphQLMutation.`
                );
            } else {
                // The card shows the RAW result (including any secret) to the
                // user; the model only ever gets the result with Sensitive-typed
                // fields redacted, so non-secret fields (ids, names) still flow.
                setResultData(result.data ?? null);
                setSucceeded(true);
                const safe = await redactForModel(result.data ?? null, doc);
                respond?.(
                    `The user approved and the mutation succeeded. Result (secret values redacted — the real secret was shown to the user in the card to copy): ${JSON.stringify(
                        safe
                    ).slice(0, 800)}`
                );
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setRunning(false);
        }
    };

    const cancel = () => {
        setCancelled(true);
        respond?.('The user declined to run the mutation.');
    };

    const copyResult = () => {
        void navigator.clipboard
            .writeText(JSON.stringify(resultData, null, 2))
            .then(() => setCopied(true))
            .catch(() => {});
    };

    if (succeeded) {
        return (
            <Box
                sx={{
                    p: 1.5,
                    my: 1,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Typography variant="body2" sx={{ mb: resultData ? 1 : 0 }}>
                    ✓ Done. Secret values below are shown only here and were
                    redacted from what the assistant received. Copy any secret
                    now — it is shown only once.
                </Typography>

                {resultData != null ? (
                    <>
                        <Box
                            sx={{
                                p: 1,
                                borderRadius: 1,
                                border: `1px solid ${theme.palette.divider}`,
                                overflowX: 'auto',
                            }}
                        >
                            <ValueView value={resultData} />
                        </Box>
                        <Button
                            size="small"
                            sx={{ mt: 1 }}
                            onClick={copyResult}
                        >
                            {copied ? 'Copied' : 'Copy result'}
                        </Button>
                    </>
                ) : null}
            </Box>
        );
    }

    if (failedMessage) {
        return (
            <Box
                sx={{
                    p: 1.5,
                    my: 1,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Typography variant="body2" color="error">
                    Mutation failed: {failedMessage}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    The assistant will propose a corrected version.
                </Typography>
            </Box>
        );
    }

    if (cancelled || status === 'complete') {
        return (
            <Box
                sx={{
                    p: 1.5,
                    my: 1,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    Cancelled — no changes were made.
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
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Approve this change?
            </Typography>

            <Typography variant="body2" sx={{ mb: 1.5 }}>
                {summary ||
                    'The assistant wants to make a change to your account.'}
            </Typography>

            <Stack spacing={1.5}>
                {operations ? (
                    <Box
                        sx={{
                            borderRadius: 1,
                            border: `1px solid ${theme.palette.divider}`,
                            p: 1.5,
                        }}
                    >
                        {operations.map((operation, index) => (
                            <Box
                                key={index}
                                sx={{
                                    mb: index < operations.length - 1 ? 1.5 : 0,
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {operation.field}
                                </Typography>
                                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                    {operation.args.map((arg) => {
                                        const complex =
                                            arg.value !== null &&
                                            typeof arg.value === 'object';
                                        return (
                                            <Box key={arg.name}>
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    {arg.name}:
                                                </Typography>{' '}
                                                {complex ? (
                                                    <ValueView
                                                        value={arg.value}
                                                    />
                                                ) : (
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                    >
                                                        {String(arg.value)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            </Box>
                        ))}
                    </Box>
                ) : null}

                {error ? (
                    <Alert severity="error" sx={{ overflowX: 'auto' }}>
                        {error}
                    </Alert>
                ) : null}

                <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                        variant="contained"
                        size="small"
                        color="warning"
                        onClick={approve}
                        disabled={running}
                        startIcon={
                            running ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : undefined
                        }
                    >
                        {running ? 'Running…' : 'Approve & run'}
                    </Button>
                    <Button size="small" onClick={cancel} disabled={running}>
                        Cancel
                    </Button>
                </Stack>

                {/* Power-user escape hatch: the exact mutation, hidden by
                    default so a non-technical user isn't shown raw GraphQL. */}
                <Box>
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => setShowDetails((prev) => !prev)}
                        sx={{ px: 0 }}
                    >
                        {showDetails
                            ? 'Hide technical details'
                            : 'Show technical details'}
                    </Button>

                    <Collapse in={showDetails}>
                        <Stack spacing={1.5} sx={{ mt: 1 }}>
                            <TextField
                                size="small"
                                fullWidth
                                multiline
                                minRows={3}
                                label="Mutation (review and edit before running)"
                                value={query}
                                onChange={(event) =>
                                    setEditedQuery(event.target.value)
                                }
                                slotProps={{
                                    input: {
                                        sx: {
                                            fontFamily: 'monospace',
                                            fontSize: 13,
                                        },
                                    },
                                }}
                            />

                            <TextField
                                size="small"
                                fullWidth
                                multiline
                                minRows={2}
                                label="Variables (JSON)"
                                value={variablesText}
                                onChange={(event) =>
                                    setEditedVariables(event.target.value)
                                }
                                slotProps={{
                                    input: {
                                        sx: {
                                            fontFamily: 'monospace',
                                            fontSize: 13,
                                        },
                                    },
                                }}
                            />
                        </Stack>
                    </Collapse>
                </Box>

                <Typography variant="caption" color="text.secondary">
                    This changes your account state. It runs as you, scoped to
                    what you are allowed to modify.
                </Typography>
            </Stack>
        </Box>
    );
}

// GraphQL access for the assistant: read-only runGraphQLQuery + describeGraphQLType
// run immediately, while runGraphQLMutation is human-in-the-loop (the user
// approves the change in a card). All run through the user's authenticated URQL
// client, scoped by the same auth/RLS as the dashboard. Must render inside
// <CopilotKit> and UrqlConfigProvider.
export default function GraphQLActions() {
    const client = useClient();

    useCopilotAction({
        name: 'runGraphQLQuery',
        description:
            "Run a READ-ONLY GraphQL query against Estuary's API as the current user (results are limited to what they're authorized to see). Use this to answer open-ended questions the other actions don't cover — inspecting live specs (captures/collections/materializations), alerts, connectors, data planes, storage mappings, tenants/billing, etc. This tool is read-only — for writes use runGraphQLMutation. If unsure of a type's fields or arguments, call describeGraphQLType first. Request only the fields you need and use `first:` to limit rows.",
        parameters: [
            {
                name: 'query',
                type: 'string',
                description:
                    'A GraphQL query operation (no mutations/subscriptions).',
                required: true,
            },
            {
                name: 'variables',
                type: 'object',
                description: 'Optional variables object for the query.',
                required: false,
            },
        ],
        handler: async ({ query, variables }) => {
            // eslint-disable-next-line no-console
            console.log('[copilot] runGraphQLQuery', query);

            let doc: DocumentNode;
            try {
                doc = parse(query);
            } catch (error) {
                return {
                    error: `Invalid GraphQL: ${
                        error instanceof Error ? error.message : String(error)
                    }`,
                };
            }

            if (hasOperation(doc, 'mutation')) {
                return {
                    error: 'This is a mutation — use runGraphQLMutation (it shows the user an approval card) instead.',
                };
            }
            if (hasOperation(doc, 'subscription')) {
                return { error: 'Subscriptions are not supported here.' };
            }

            try {
                const result = await client
                    .query(doc, (variables as Record<string, unknown>) ?? {})
                    .toPromise();
                const safeData = await redactForModel(result.data ?? null, doc);
                return summarizeResult({ data: safeData, error: result.error });
            } catch (error) {
                return {
                    error:
                        error instanceof Error ? error.message : String(error),
                };
            }
        },
    });

    useHumanInTheLoop({
        name: 'runGraphQLMutation',
        description:
            "Propose a GraphQL MUTATION that changes the user's Estuary account state (e.g. alert subscriptions/configs, invite links, refresh tokens, storage mappings). This does NOT run immediately — it shows the user an approval card where they review/edit the mutation and confirm. Before calling, briefly tell the user what you intend to change. If unsure which mutations exist or their arguments, call describeGraphQLType('MutationRoot') first. You receive the outcome after the user approves or cancels.",
        parameters: [
            {
                name: 'query',
                type: 'string',
                description: 'A GraphQL mutation operation.',
                required: true,
            },
            {
                name: 'variables',
                type: 'object',
                description: 'Optional variables object for the mutation.',
                required: false,
            },
            {
                name: 'summary',
                type: 'string',
                description:
                    'A plain-language, jargon-free description of what this change does (e.g. "Create a service account named gCo/automation with read access to gCo/"). This is the MAIN thing the user sees on the approval card — write it for a non-technical reader; the raw GraphQL is hidden by default.',
                required: true,
            },
        ],
        render: ({ status, args, respond }: any) => (
            <MutationApprovalCard
                summary={args?.summary ?? ''}
                initialQuery={args?.query ?? ''}
                initialVariables={
                    args?.variables
                        ? JSON.stringify(args.variables, null, 2)
                        : ''
                }
                status={status}
                respond={respond}
            />
        ),
    });

    useCopilotAction({
        name: 'describeGraphQLType',
        description:
            "Look up a GraphQL type's fields, their result types, and arguments via introspection, so you can write a correct runGraphQLQuery. Start with 'QueryRoot' to see the available top-level queries, then drill into result types (e.g. 'LiveSpec', 'Alert', 'Tenant', 'Connector').",
        parameters: [
            {
                name: 'typeName',
                type: 'string',
                description:
                    "A GraphQL type name, e.g. 'QueryRoot', 'LiveSpec', 'Alert', 'Tenant'.",
                required: true,
            },
        ],
        handler: async ({ typeName }) => {
            // eslint-disable-next-line no-console
            console.log('[copilot] describeGraphQLType', typeName);
            try {
                const result = await client
                    .query(DESCRIBE_TYPE_DOC, { name: typeName })
                    .toPromise();

                const type = (result.data as any)?.__type;
                if (!type) {
                    return {
                        error: `Type "${typeName}" not found (or introspection is disabled).`,
                        detail: result.error?.message,
                    };
                }

                return {
                    name: type.name,
                    kind: type.kind,
                    description: type.description,
                    fields: (type.fields ?? []).map((field: any) => ({
                        name: field.name,
                        type: renderTypeRef(field.type),
                        args: (field.args ?? []).map(renderArg),
                        description: field.description,
                    })),
                    inputFields: (type.inputFields ?? []).map(renderArg),
                    enumValues: (type.enumValues ?? []).map((e: any) => e.name),
                    possibleTypes: (type.possibleTypes ?? []).map(
                        (p: any) => p.name
                    ),
                };
            } catch (error) {
                return {
                    error:
                        error instanceof Error ? error.message : String(error),
                };
            }
        },
    });

    return null;
}
