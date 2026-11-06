import type {
    CaptureDraftSpec,
    MaterializationsDraftSpec,
} from 'src/hooks/drafts/useGetDraftSpec';
import type * as Urql from 'urql';

import { renderHook } from '@testing-library/react';
import { useMutation } from 'urql';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { createDraftSpec, modifyDraftSpec } from 'src/api/draftSpecs';
import { UrqlConfigProvider } from 'src/context/URQL';
import { useSaveDraftSpec } from 'src/hooks/drafts/useSaveDraftSpec';
import unsortedSopsConfig from 'src/test/fixtures/unsortedSopsConfig.json';
import { graphql, HttpResponse, server } from 'src/test/server/test-server';
import { dropFetchSignals } from 'src/test/shared';
import { getGqlUrl } from 'src/utils/env-utils';

const { useMutation: actualUseMutation } =
    await vi.importActual<typeof Urql>('urql');

vi.mock(import('urql'), async (importOriginal) => ({
    ...(await importOriginal()),
    useMutation: vi.fn(),
}));

vi.mock(import('src/api/draftSpecs'), async (importOriginal) => ({
    ...(await importOriginal()),
    createDraftSpec: vi.fn(),
    modifyDraftSpec: vi.fn(),
}));

const DRAFT_ID = '1111111111111111';
const PUB_ID = '2222222222222222';
const CAPTURE_NAME = 'acmeCo/source-hello-world';
const MATERIALIZATION_NAME = 'acmeCo/materialize-postgres';

const ENCRYPTED_CONFIG = {
    password_sops: 'ENC[AES256_GCM,data:foo,tag:bar,type:str]',
    sops: {},
};

const captureDraftSpec = (
    config: object = ENCRYPTED_CONFIG,
    expectPubId: string | null = PUB_ID
): CaptureDraftSpec => ({
    expect_pub_id: expectPubId,
    spec: {
        bindings: [],
        endpoint: { connector: { image: 'source-hello-world:dev', config } },
    } as any,
});

const materializationDraftSpec = (
    endpoint: object = {
        connector: {
            image: 'materialize-postgres:dev',
            config: ENCRYPTED_CONFIG,
        },
    }
): MaterializationsDraftSpec => ({
    expect_pub_id: PUB_ID,
    spec: { bindings: [], endpoint } as any,
});

const stageDraftSpecs = vi.fn();

describe('useSaveDraftSpec', () => {
    beforeEach(() => {
        stageDraftSpecs.mockReset();
        stageDraftSpecs.mockResolvedValue({
            data: { stageDraftSpecs: [CAPTURE_NAME] },
        });
        vi.mocked(useMutation).mockReturnValue([{} as never, stageDraftSpecs]);

        vi.mocked(createDraftSpec).mockReset();
        vi.mocked(createDraftSpec).mockResolvedValue({
            data: [{}],
            error: null,
        } as never);
        vi.mocked(modifyDraftSpec).mockReset();
        vi.mocked(modifyDraftSpec).mockResolvedValue({
            data: [{}],
            error: null,
        } as never);
    });

    describe('capture', () => {
        const renderSave = () =>
            renderHook(() => useSaveDraftSpec('capture')).result.current;

        test('stages the spec with its drafted precondition', async () => {
            const draftSpec = captureDraftSpec();

            await expect(
                renderSave()(DRAFT_ID, CAPTURE_NAME, draftSpec)
            ).resolves.toEqual({ value: draftSpec });

            expect(stageDraftSpecs).toHaveBeenCalledWith({
                draftId: DRAFT_ID,
                specs: {
                    catalogName: CAPTURE_NAME,
                    catalogType: 'capture',
                    model: draftSpec.spec,
                    expectPubId: PUB_ID,
                },
            });
        });

        test('passes a null precondition through rather than dropping it', async () => {
            await renderSave()(
                DRAFT_ID,
                CAPTURE_NAME,
                captureDraftSpec(ENCRYPTED_CONFIG, null)
            );

            expect(stageDraftSpecs.mock.calls[0][0].specs.expectPubId).toBe(
                null
            );
        });

        // sops computes the MAC over values in document order, so a config sent
        // with its keys sorted fails to decrypt (estuary/ui#2178)
        describe('through the app client', () => {
            // Saves with the app's URQL client and returns the request body
            const stage = async (config: object) => {
                let body = '';
                server.use(
                    graphql
                        .link(getGqlUrl())
                        .mutation('StageDraftSpecs', async ({ request }) => {
                            body = await request.text();
                            return HttpResponse.json({
                                data: { stageDraftSpecs: [CAPTURE_NAME] },
                            });
                        })
                );
                vi.mocked(useMutation).mockImplementation(actualUseMutation);
                dropFetchSignals();

                const save = renderHook(() => useSaveDraftSpec('capture'), {
                    wrapper: UrqlConfigProvider,
                }).result.current;
                const draftSpec = captureDraftSpec(config);

                await expect(
                    save(DRAFT_ID, CAPTURE_NAME, draftSpec)
                ).resolves.toEqual({ value: draftSpec });

                return body;
            };

            test('sends the config with its keys in their original order', async () => {
                const config = {
                    user: 'flow_capture',
                    address: 'db:5432',
                    password_sops: 'ENC[AES256_GCM,data:foo,tag:bar,type:str]',
                    sops: { mac: 'ENC[AES256_GCM,data:baz,tag:qux,type:str]' },
                };

                expect(await stage(config)).toContain(JSON.stringify(config));
            });

            // The fixture was encrypted with the sops CLI using the local stack's
            // test age key. It decrypts as is and fails with a MAC mismatch once
            // its keys are sorted.
            test('sends a sops CLI encrypted config unchanged', async () => {
                expect(await stage(unsortedSopsConfig)).toContain(
                    JSON.stringify(unsortedSopsConfig)
                );
            });
        });

        test('rejects an unencrypted config without staging it', async () => {
            const { error } = await renderSave()(
                DRAFT_ID,
                CAPTURE_NAME,
                captureDraftSpec({ password: 'plaintext' })
            );

            expect(error?.message).toMatch(/must be encrypted/);
            expect(stageDraftSpecs).not.toHaveBeenCalled();
        });

        test('rejects an endpoint that is not a connector', async () => {
            const draftSpec = captureDraftSpec();
            draftSpec.spec.endpoint = {
                local: { command: ['run'], config: {} },
            } as any;

            const { error } = await renderSave()(
                DRAFT_ID,
                CAPTURE_NAME,
                draftSpec
            );

            expect(error?.message).toMatch(/connector or dekaf/);
            expect(stageDraftSpecs).not.toHaveBeenCalled();
        });

        test('returns the staging error', async () => {
            const stagingError = new Error('staging failed');
            stageDraftSpecs.mockResolvedValue({ error: stagingError });

            await expect(
                renderSave()(DRAFT_ID, CAPTURE_NAME, captureDraftSpec())
            ).resolves.toEqual({ error: stagingError });
        });
    });

    describe('materialization', () => {
        const renderSave = () =>
            renderHook(() => useSaveDraftSpec('materialization')).result
                .current;

        test('modifies the drafted materialization when updating', async () => {
            const draftSpec = materializationDraftSpec();

            await renderSave()(DRAFT_ID, MATERIALIZATION_NAME, draftSpec, true);

            expect(modifyDraftSpec).toHaveBeenCalledWith(
                draftSpec.spec,
                { draft_id: DRAFT_ID, spec_type: 'materialization' },
                MATERIALIZATION_NAME
            );
            expect(createDraftSpec).not.toHaveBeenCalled();
        });

        test('creates the materialization with its precondition when new', async () => {
            const draftSpec = materializationDraftSpec();

            await renderSave()(
                DRAFT_ID,
                MATERIALIZATION_NAME,
                draftSpec,
                false
            );

            expect(createDraftSpec).toHaveBeenCalledWith(
                DRAFT_ID,
                MATERIALIZATION_NAME,
                draftSpec.spec,
                'materialization',
                PUB_ID
            );
            expect(modifyDraftSpec).not.toHaveBeenCalled();
        });

        test('accepts an encrypted Dekaf endpoint', async () => {
            const draftSpec = materializationDraftSpec({
                dekaf: { variant: 'generic', config: ENCRYPTED_CONFIG },
            });

            await expect(
                renderSave()(DRAFT_ID, MATERIALIZATION_NAME, draftSpec, false)
            ).resolves.toEqual({ value: draftSpec });
        });

        test('rejects an unencrypted config without writing it', async () => {
            const { error } = await renderSave()(
                DRAFT_ID,
                MATERIALIZATION_NAME,
                materializationDraftSpec({
                    connector: { image: 'x', config: { password: 'plain' } },
                }),
                true
            );

            expect(error?.message).toMatch(/must be encrypted/);
            expect(modifyDraftSpec).not.toHaveBeenCalled();
            expect(createDraftSpec).not.toHaveBeenCalled();
        });
    });
});
