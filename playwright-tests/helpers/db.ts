import { Client } from 'pg';

// The local Supabase database, for asserting on state the UI wrote
const CONNECTION_STRING =
    process.env.SUPABASE_DB_URL ??
    'postgresql://postgres:postgres@localhost:5432/postgres';

export const query = async <T = any>(
    text: string,
    values: any[] = []
): Promise<T[]> => {
    const client = new Client({ connectionString: CONNECTION_STRING });
    await client.connect();

    try {
        const result = await client.query(text, values);
        return result.rows as T[];
    } finally {
        await client.end();
    }
};

// Tenants get the default task quota, which repeated local test runs
// outgrow, as each run publishes new tasks
export const raiseTaskQuota = async (tenant: string, quota = 1000) => {
    await query(
        `update tenants set tasks_quota = greatest(tasks_quota, $2) where tenant = $1`,
        [tenant.endsWith('/') ? tenant : `${tenant}/`, quota]
    );
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface StagedSpec {
    catalogName: string;
    // A null spec and type stage a deletion
    spec: object | null;
    specType: 'capture' | 'collection' | 'materialization' | null;
    expectPubId: string | null;
}

// Publishes `specs` as the test user, the same way the UI publishes, and
// resolves once the publication succeeds. The agent then applies it to the
// data plane, which writing the live specs directly would skip.
export const publishDraftSpecs = async (
    email: string,
    specs: StagedSpec[],
    detail: string
) => {
    const [{ userId }] = await query<{ userId: string }>(
        `select id as "userId" from auth.users where email = $1`,
        [email]
    );
    const [{ draftId }] = await query<{ draftId: string }>(
        `insert into drafts (user_id, detail) values ($1, $2)
        returning id::text as "draftId"`,
        [userId, detail]
    );

    for (const { catalogName, spec, specType, expectPubId } of specs) {
        await query(
            `insert into draft_specs (draft_id, catalog_name, spec, spec_type, expect_pub_id)
            values ($1, $2, $3, $4, $5)`,
            [draftId, catalogName, spec, specType, expectPubId]
        );
    }

    const [{ pubId }] = await query<{ pubId: string }>(
        `insert into publications (user_id, draft_id, detail)
        values ($1, $2, $3) returning id::text as "pubId"`,
        [userId, draftId, detail]
    );

    for (let attempt = 0; attempt < 60; attempt += 1) {
        const [{ status }] = await query<{ status: string }>(
            `select job_status->>'type' as status from publications where id = $1`,
            [pubId]
        );

        if (status === 'success') {
            return;
        }
        if (status !== 'queued') {
            throw new Error(
                `Publishing ${detail} failed with status ${status}`
            );
        }

        await sleep(2000);
    }

    throw new Error(`Publishing ${detail} timed out`);
};

// Deletes every live spec under `catalogPrefix` by publishing their deletions
export const deleteLiveSpecs = async (email: string, catalogPrefix: string) => {
    const live = await query<{ catalogName: string; lastPubId: string }>(
        `select catalog_name as "catalogName", last_pub_id::text as "lastPubId"
        from live_specs
        where starts_with(catalog_name, $1) and spec is not null`,
        [catalogPrefix]
    );
    if (live.length === 0) {
        return;
    }

    await publishDraftSpecs(
        email,
        live.map(({ catalogName, lastPubId }) => ({
            catalogName,
            spec: null,
            specType: null,
            expectPubId: lastPubId,
        })),
        `playwright cleanup of ${catalogPrefix}`
    );
};
