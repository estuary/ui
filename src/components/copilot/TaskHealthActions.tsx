import type { OpsLogFlowDocument } from 'src/types';

import { useCopilotAction } from '@copilotkit/react-core';
import { JournalClient } from 'data-plane-gateway';

import { getEntityStatus } from 'src/api/entityStatus';
import { getPublicationHistoryByCatalogName } from 'src/api/publicationSpecsExt';
import { getStatsByName } from 'src/api/stats';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { loadDocuments } from 'src/hooks/journals/shared';
import { authorizeTask } from 'src/utils/dataPlane-utils';

// In-dashboard equivalent of the `estuary-task-health` agent skill. Instead of
// shelling out to flowctl, these helpers call the dashboard's existing data
// layer imperatively (status API, catalog_stats, ops-log journals, publication
// history) so the assistant can run the same four-check health diagnosis.

const getToken = () => useUserStore.getState().session?.access_token;

const errorMessage = (error: unknown) =>
    error instanceof Error ? error.message : String(error);

// Check 1 — control-plane status (flowctl catalog status).
async function fetchTaskStatus(taskName: string) {
    const token = getToken();
    if (!token) {
        return { error: 'No session token available.' };
    }

    const responses = await getEntityStatus(token, taskName);
    const status = responses?.[0];

    if (!status) {
        return { found: false, note: 'No status found for this task.' };
    }

    return {
        found: true,
        statusType: status.controller_status?.type ?? 'unknown',
        controllerFailures: status.controller_failures,
        controllerError: status.controller_error ?? null,
        disabled: Boolean(status.disabled),
        specType: status.spec_type,
    };
}

// Check 2 — data flow (flowctl raw stats). Today's grain.
async function fetchTaskStatsToday(taskName: string) {
    const response = await getStatsByName([taskName], 'today');
    const rows = (response.data ?? []).filter(
        (row): row is NonNullable<typeof row> => Boolean(row)
    );

    if (rows.length === 0) {
        return { found: false, note: 'No stats recorded for today.' };
    }

    return {
        found: true,
        docsWritten: rows.reduce((sum, r) => sum + (r.docs_written_by_me ?? 0), 0),
        bytesWritten: rows.reduce(
            (sum, r) => sum + (r.bytes_written_by_me ?? 0),
            0
        ),
        docsRead: rows.reduce((sum, r) => sum + (r.docs_read_by_me ?? 0), 0),
        bytesRead: rows.reduce((sum, r) => sum + (r.bytes_read_by_me ?? 0), 0),
    };
}

// Check 3 — recent errors/warnings (flowctl logs). Reads the tail of the task's
// ops-log journal and keeps only error/warn entries.
async function fetchTaskRecentErrors(taskName: string) {
    const token = getToken();
    if (!token) {
        return { error: 'No session token available.' };
    }

    const auth = await authorizeTask(token, taskName);
    const client = new JournalClient(
        new URL(auth.brokerAddress),
        auth.brokerToken
    );

    const { documents } = await loadDocuments({
        journalName: auth.opsLogsJournal,
        client,
        maxBytes: 1024 * 256,
    });

    const logs = (documents ?? []) as OpsLogFlowDocument[];
    const issues = logs
        .filter((doc) => doc.level === 'error' || doc.level === 'warn')
        .slice(-50)
        .map((doc) => ({
            ts: doc.ts,
            level: doc.level,
            message: doc.message,
            error:
                (doc.fields as Record<string, unknown> | undefined)?.error ??
                null,
        }));

    return { sampledDocuments: logs.length, issueCount: issues.length, issues };
}

// Check 4 — recent spec changes (flowctl catalog history).
async function fetchTaskHistory(taskName: string) {
    const { data, error } = await getPublicationHistoryByCatalogName(taskName);

    if (error) {
        return { error: error.message };
    }

    return {
        recent: (data ?? []).slice(0, 5).map((pub) => ({
            at: pub.published_at,
            who: pub.user_email,
            detail: pub.detail,
        })),
    };
}

// Registers the task-health actions on the CopilotKit runtime. Must render
// inside the <CopilotKit> provider.
export default function TaskHealthActions() {
    useCopilotAction({
        name: 'getTaskStats',
        description:
            "Look up today's data-flow stats (documents and bytes read/written) for a specific Estuary Flow task by its full catalog name. Use for quick throughput / is-data-moving questions.",
        parameters: [
            {
                name: 'taskName',
                type: 'string',
                description:
                    'Full catalog name of the task, e.g. "acmeCo/postgres-capture".',
                required: true,
            },
        ],
        handler: async ({ taskName }) => {
            // eslint-disable-next-line no-console
            console.log('[copilot] getTaskStats called for', taskName);
            try {
                return { taskName, ...(await fetchTaskStatsToday(taskName)) };
            } catch (error) {
                return { taskName, error: errorMessage(error) };
            }
        },
    });

    useCopilotAction({
        name: 'diagnoseTaskHealth',
        description:
            'Run a full health check on a single Estuary Flow task (capture, materialization, or derivation) by its full catalog name. Gathers control-plane status, today\'s data-flow stats, recent error/warning logs, and recent publication history. Use when the user asks "is my task healthy", "what\'s wrong with my pipeline", "why is data not flowing", or to diagnose an alert. After calling, synthesize a verdict per the task-health guidance in your instructions.',
        parameters: [
            {
                name: 'taskName',
                type: 'string',
                description:
                    'Full catalog name of the task, e.g. "acmeCo/postgres-capture".',
                required: true,
            },
        ],
        handler: async ({ taskName }) => {
            // eslint-disable-next-line no-console
            console.log('[copilot] diagnoseTaskHealth called for', taskName);

            const [status, stats, recentErrors, history] = await Promise.all([
                fetchTaskStatus(taskName).catch((error) => ({
                    error: errorMessage(error),
                })),
                fetchTaskStatsToday(taskName).catch((error) => ({
                    error: errorMessage(error),
                })),
                fetchTaskRecentErrors(taskName).catch((error) => ({
                    error: errorMessage(error),
                })),
                fetchTaskHistory(taskName).catch((error) => ({
                    error: errorMessage(error),
                })),
            ]);

            return { taskName, status, stats, recentErrors, history };
        },
    });

    return null;
}
