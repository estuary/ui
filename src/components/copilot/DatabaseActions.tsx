import { useState } from 'react';

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';

import { useHumanInTheLoop } from '@copilotkit/react-core';

import { getCopilotSettings } from 'src/utils/env-utils';

// The dev runtime exposes a /run-sql endpoint alongside /copilotkit; derive its
// URL from the runtime URL so it tracks whatever VITE_COPILOT_RUNTIME_URL is.
const runSqlUrl = `${new URL(getCopilotSettings().runtimeUrl).origin}/run-sql`;

interface Connection {
    host: string;
    port: string;
    database: string;
    user: string;
    password: string;
}

// Host/port default to the local runtime's reach to the dev Postgres; the rest
// the user fills in. The runtime (a Node process on the user's machine) connects
// from here, so 127.0.0.1 is correct even though the connector container uses a
// different in-network name.
const DEFAULT_CONNECTION: Connection = {
    host: '127.0.0.1',
    port: '5432',
    database: '',
    user: '',
    password: '',
};

// The human-in-the-loop "approve and run" card. Shows the proposed SQL (editable
// — the user reviews and can tweak it), collects DB admin credentials, and on
// approval POSTs both to the runtime's /run-sql endpoint. Credentials go only to
// the local runtime, never into the respond() payload the assistant sees.
function RunSqlCard({
    summary,
    initialSql,
    status,
    respond,
}: {
    summary: string;
    initialSql: string;
    status: string;
    respond?: (result: string) => void;
}) {
    const theme = useTheme();

    // CopilotKit streams the tool args into this render incrementally, so
    // initialSql arrives across several renders. Track edits separately and fall
    // back to the (latest) prop until the user types — seeding useState directly
    // would freeze the field to the first, empty render.
    const [editedSql, setEditedSql] = useState<string | null>(null);
    const sql = editedSql ?? initialSql;
    const [connection, setConnection] = useState<Connection>(DEFAULT_CONNECTION);
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(
        null
    );
    const [cancelled, setCancelled] = useState(false);

    const setField = (key: keyof Connection, value: string) =>
        setConnection((prev) => ({ ...prev, [key]: value }));

    const run = async () => {
        setRunning(true);
        setResult(null);
        try {
            const response = await fetch(runSqlUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connection, sql }),
            });
            const data = await response.json();
            setResult(data);

            // Only resolve the action on success; on failure keep the card open
            // so the user can fix the SQL or credentials and retry.
            if (data.ok) {
                respond?.(
                    'The user approved and the SQL ran successfully against their database.'
                );
            }
        } catch (error) {
            setResult({
                ok: false,
                error: error instanceof Error ? error.message : String(error),
            });
        } finally {
            setRunning(false);
        }
    };

    const cancel = () => {
        setCancelled(true);
        respond?.(
            'The user declined to run the SQL here and will run it themselves.'
        );
    };

    if (result?.ok) {
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
                    ✓ SQL ran successfully against your database.
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
                    Cancelled — no SQL was run.
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
                Run setup SQL
            </Typography>

            {summary ? (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5 }}
                >
                    {summary}
                </Typography>
            ) : null}

            <Stack spacing={1.5}>
                <TextField
                    size="small"
                    fullWidth
                    multiline
                    minRows={4}
                    label="SQL to run (review and edit before running)"
                    value={sql}
                    onChange={(event) => setEditedSql(event.target.value)}
                    slotProps={{
                        input: {
                            sx: { fontFamily: 'monospace', fontSize: 13 },
                        },
                    }}
                />

                <Stack direction="row" spacing={1}>
                    <TextField
                        size="small"
                        label="Host"
                        value={connection.host}
                        onChange={(event) =>
                            setField('host', event.target.value)
                        }
                        sx={{ flex: 2 }}
                    />
                    <TextField
                        size="small"
                        label="Port"
                        value={connection.port}
                        onChange={(event) =>
                            setField('port', event.target.value)
                        }
                        sx={{ flex: 1 }}
                    />
                </Stack>

                <TextField
                    size="small"
                    fullWidth
                    label="Database"
                    value={connection.database}
                    onChange={(event) =>
                        setField('database', event.target.value)
                    }
                />

                <Stack direction="row" spacing={1}>
                    <TextField
                        size="small"
                        label="Admin user"
                        value={connection.user}
                        onChange={(event) =>
                            setField('user', event.target.value)
                        }
                        sx={{ flex: 1 }}
                    />
                    <TextField
                        size="small"
                        type="password"
                        label="Password"
                        value={connection.password}
                        onChange={(event) =>
                            setField('password', event.target.value)
                        }
                        sx={{ flex: 1 }}
                    />
                </Stack>

                {result && !result.ok ? (
                    <Alert severity="error" sx={{ overflowX: 'auto' }}>
                        {result.error}
                    </Alert>
                ) : null}

                <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                        variant="contained"
                        size="small"
                        onClick={run}
                        disabled={running}
                        startIcon={
                            running ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : undefined
                        }
                    >
                        {running ? 'Running…' : 'Run SQL'}
                    </Button>
                    <Button size="small" onClick={cancel} disabled={running}>
                        Cancel
                    </Button>
                </Stack>

                <Typography variant="caption" color="text.secondary">
                    Credentials stay between your browser and the local runtime —
                    they are never sent to the assistant.
                </Typography>
            </Stack>
        </Box>
    );
}

// Registers the assistant's database-remediation action. Must render inside the
// <CopilotKit> provider. Dev-only: it runs admin SQL against a user-supplied
// database connection via the local runtime.
export default function DatabaseActions() {
    useHumanInTheLoop({
        name: 'runSetupSql',
        description:
            "Offer to run setup SQL against the user's database on their behalf, with their approval. Call this ONLY after you have shown the SQL, explained what it does, and the user has agreed to let you run it. Pass the SQL and a one-line summary. The user reviews/edits the SQL and enters their own database admin credentials in a form — those credentials are NOT shared with you. You only receive whether execution succeeded. After it succeeds, tell the user to re-save/publish the capture.",
        parameters: [
            {
                name: 'sql',
                type: 'string',
                description:
                    'The SQL to run, e.g. "CREATE PUBLICATION flow_publication; ALTER PUBLICATION flow_publication ADD TABLE public.flow_watermarks, public.test_source;".',
                required: true,
            },
            {
                name: 'summary',
                type: 'string',
                description:
                    'A one-line description of what this SQL does, shown above the SQL.',
                required: false,
            },
        ],
        render: ({ status, args, respond }: any) => (
            <RunSqlCard
                summary={args?.summary ?? ''}
                initialSql={args?.sql ?? ''}
                status={status}
                respond={respond}
            />
        ),
    });

    return null;
}
