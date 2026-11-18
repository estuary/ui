import {
    deleteLiveSpecs,
    publishDraftSpecs,
    query,
    raiseTaskQuota,
} from '../helpers/db';
import {
    clickNext,
    createDekafMaterialization,
    ensureSourceCollection,
    getDraftedMaterializations,
    getLiveTask,
} from '../helpers/materializations';
import { USERS } from '../helpers/users';
import {
    closeLogsOnSuccess,
    defaultPageSetup,
    publishAndOpenDetails,
} from '../helpers/utils';
import { expect, test } from '@playwright/test';

// Reading spec as text preserves the encrypted endpoint's JSON ordering when republishing it.
const readDraft = async (draftId: string, name: string) => {
    const [row] = await query<{ spec: string; built: any }>(
        `select spec::text as spec, built_spec::jsonb as built from draft_specs
         where draft_id = $1 and catalog_name = $2`,
        [draftId, name]
    );
    return { spec: JSON.parse(row.spec), built: row.built };
};

for (const indirect of [false, true]) {
    for (const bindingCount of [1, 2]) {
        test(`${indirect ? 'indirect' : 'inline'}: pending resource edits preserve fields and backfill (${bindingCount} bindings)`, async ({
            page,
        }) => {
            test.setTimeout(240000);
            page.setDefaultTimeout(30000);
            const { email, tenant } = await defaultPageSetup(
                page,
                test,
                USERS.materializations
            );
            const announcement = page.getByRole('button', {
                name: 'Dismiss',
                exact: true,
            });
            if (await announcement.isVisible()) await announcement.click();
            const suffix = `resource-edits-${crypto.randomUUID().split('-')[0]}`;
            const prefix = `${tenant}/${suffix}`;
            await raiseTaskQuota(tenant);
            const source = await ensureSourceCollection(page, tenant);
            await createDekafMaterialization(page, suffix, source);
            await clickNext(page);
            const [created] = await getDraftedMaterializations(suffix);
            const { endpoint } = (
                await readDraft(created.draftId, created.catalogName)
            ).spec;
            const collection = `${prefix}/records`;
            const bindings = [
                {
                    source: collection,
                    resource: { topic_name: `${suffix}-a` },
                    fields: {
                        recommended: true,
                        groupBy: ['id'],
                        exclude: ['payload'],
                    },
                    backfill: 2,
                },
                {
                    source: collection,
                    resource: { topic_name: `${suffix}-b` },
                    fields: {
                        recommended: true,
                        groupBy: ['category'],
                        exclude: ['payload'],
                    },
                    backfill: 5,
                },
            ].slice(0, bindingCount);
            await publishDraftSpecs(
                email,
                [
                    {
                        catalogName: collection,
                        specType: 'collection',
                        expectPubId: null,
                        spec: {
                            key: ['/id'],
                            schema: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    category: { type: 'string' },
                                    payload: { type: 'string' },
                                },
                                required: ['id', 'category', 'payload'],
                            },
                        },
                    },
                    {
                        catalogName: created.catalogName,
                        specType: 'materialization',
                        expectPubId: null,
                        spec: {
                            endpoint,
                            bindings,
                            shards: {
                                flags: indirect
                                    ? { 'indirect-specs': 'true' }
                                    : {},
                            },
                        },
                    },
                ],
                suffix
            );

            try {
                const live = (await getLiveTask(created.catalogName))!;
                await page.goto(
                    `http://localhost:3000/materializations/edit?liveSpecId=${live.id}&lastPubId=${live.lastPubId}`
                );
                const fields = page.getByRole('table', {
                    name: 'Field Selection Editor',
                });
                await expect(fields).toContainText('payload', {
                    timeout: 120000,
                });
                const draftId = new URL(page.url()).searchParams.get(
                    'draftId'
                )!;
                const targetIndex = bindingCount - 1;
                await page
                    .getByRole('button', { name: collection, exact: true })
                    .nth(targetIndex)
                    .click();
                const topic = page.getByRole('textbox', { name: 'Topic Name' });
                await expect(topic).toHaveValue(
                    bindings[targetIndex].resource.topic_name
                );
                await expect(
                    page.getByRole('button', { name: 'Refresh', exact: true })
                ).toBeEnabled({ timeout: 120000 });
                await expect(
                    page.getByRole('button', { name: 'Save and publish' })
                ).toBeVisible();
                const before = (await readDraft(draftId, created.catalogName))
                    .spec.bindings;
                expect(
                    before[targetIndex].fields.require ?? {}
                ).not.toHaveProperty('payload');
                const editedTopic = `${suffix}-renamed`;
                await topic.fill(editedTopic);
                await expect(
                    page.getByRole('button', { name: 'Next', exact: true })
                ).toBeVisible();

                await fields
                    .getByRole('row')
                    .filter({ has: page.getByText('payload', { exact: true }) })
                    .getByRole('button', { name: 'Require', exact: true })
                    .click();
                const draftedBindings = async () =>
                    (await readDraft(draftId, created.catalogName)).spec
                        .bindings;
                await expect
                    .poll(
                        async () =>
                            (await draftedBindings())[targetIndex].fields
                                .require
                    )
                    .toHaveProperty('payload');
                await expect(topic).toHaveValue(editedTopic);

                await page
                    .getByRole('button', {
                        name: /^Advanced Options/,
                    })
                    .last()
                    .click();
                const backfill = page
                    .getByRole('button', { name: 'Backfill', exact: true })
                    .last();
                await expect(backfill).toBeVisible();
                await expect(backfill).toHaveAttribute('aria-pressed', 'false');
                await backfill.click();
                await expect
                    .poll(
                        async () =>
                            (await draftedBindings())[targetIndex].backfill
                    )
                    .toBe(before[targetIndex].backfill + 1);

                if (bindingCount === 2) {
                    expect((await draftedBindings())[0]).toEqual(before[0]);
                    await page
                        .getByRole('button', {
                            name: /^Advanced Options/,
                        })
                        .first()
                        .click();
                    const backfillAll = page
                        .getByRole('button', { name: 'Backfill', exact: true })
                        .first();
                    await expect(backfillAll).toBeEnabled();
                    await backfillAll.click();
                    await expect
                        .poll(async () =>
                            (await draftedBindings()).map(
                                (binding: any) => binding.backfill
                            )
                        )
                        .toEqual([3, 6]);
                    await expect(backfillAll).toBeEnabled();
                    await backfillAll.click();
                    await expect
                        .poll(async () =>
                            (await draftedBindings()).map(
                                (binding: any) => binding.backfill
                            )
                        )
                        .toEqual([2, 5]);
                    await expect(backfill).toBeEnabled();
                    await backfill.click();
                    await expect
                        .poll(async () => (await draftedBindings())[1].backfill)
                        .toBe(6);
                }

                // Field/backfill writes must not regenerate the draft or discard the pending resource edit.
                await expect(topic).toHaveValue(editedTopic);
                const edited = await draftedBindings();
                expect(edited[targetIndex].resource).toEqual(
                    before[targetIndex].resource
                );
                expect(edited[targetIndex].fields.groupBy).toEqual(
                    before[targetIndex].fields.groupBy
                );
                if (bindingCount === 2) expect(edited[0]).toEqual(before[0]);
                const expected = structuredClone(edited);
                expected[targetIndex].resource.topic_name = editedTopic;

                await page
                    .getByRole('button', { name: 'Refresh', exact: true })
                    .click();
                await expect(
                    page.getByRole('button', { name: 'Refresh', exact: true })
                ).toBeEnabled({ timeout: 120000 });
                await expect.poll(draftedBindings).toEqual(expected);
                const { built } = await readDraft(draftId, created.catalogName);
                expect(Boolean(built.linkedCollections?.length)).toBe(indirect);
                expect(built.bindings[targetIndex].resourcePath).toEqual([
                    editedTopic,
                ]);
                const compiledCollection = indirect
                    ? built.linkedCollections[
                          built.bindings[targetIndex].collectionIndex ?? 0
                      ]
                    : built.bindings[targetIndex].collection;
                expect(compiledCollection.key).toEqual([
                    bindingCount === 2 ? '/category' : '/id',
                ]);

                await page
                    .getByRole('button', { name: 'Test', exact: true })
                    .click();
                await closeLogsOnSuccess(page);
                await publishAndOpenDetails(page);
                const published = (await getLiveTask(created.catalogName))!;
                // Publication records the newly validated resource path.
                expected[targetIndex].resource._meta.path = [editedTopic];
                expect(published.spec.bindings).toEqual(expected);
                await page.goto(
                    `http://localhost:3000/materializations/edit?liveSpecId=${published.id}&lastPubId=${published.lastPubId}`
                );
                await expect(fields).toContainText('payload', {
                    timeout: 120000,
                });
                const reopenedId = new URL(page.url()).searchParams.get(
                    'draftId'
                )!;
                expect(
                    (await readDraft(reopenedId, created.catalogName)).spec
                        .bindings
                ).toEqual(expected);
            } finally {
                await deleteLiveSpecs(email, prefix);
            }
        });
    }
}
