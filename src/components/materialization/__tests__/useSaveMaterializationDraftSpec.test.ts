import type { MaterializationDef } from 'deps/flow/flow';

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { createDraftSpec, modifyDraftSpec } from 'src/api/draftSpecs';
import { useSaveMaterializationDraftSpec } from 'src/components/materialization/useSaveMaterializationDraftSpec';
import { useGetDraftSpec } from 'src/hooks/drafts/useGetDraftSpec';
import { useSecretsStore_usesSecrets } from 'src/stores/Secrets/hooks';

vi.mock(import('src/api/draftSpecs'), async (importOriginal) => ({
    ...(await importOriginal()),
    createDraftSpec: vi.fn(),
    modifyDraftSpec: vi.fn(),
}));

vi.mock(import('src/hooks/drafts/useGetDraftSpec'), async (importOriginal) => ({
    ...(await importOriginal()),
    useGetDraftSpec: vi.fn(),
}));

vi.mock(import('src/stores/Secrets/hooks'), async (importOriginal) => ({
    ...(await importOriginal()),
    useSecretsStore_usesSecrets: vi.fn(),
}));

const DRAFT_ID = '1111111111111111';
const PUB_ID = '2222222222222222';
const MATERIALIZATION_NAME = 'acmeCo/materialize-postgres';

const CONFIG = { password_sops: 'ENC[...]', sops: {} };
const PLAINTEXT_CONFIG = { password: 'hunter2' };

const materializationSpecDef = (
    endpoint: object = {
        connector: { image: 'materialize-postgres:dev', config: CONFIG },
    }
): MaterializationDef => ({ bindings: [], endpoint }) as any;

const getDraftSpec = vi.fn();

describe('useSaveMaterializationDraftSpec', () => {
    beforeEach(() => {
        getDraftSpec.mockReset();
        getDraftSpec.mockResolvedValue({ value: null });
        vi.mocked(useGetDraftSpec).mockReturnValue(getDraftSpec as never);

        vi.mocked(useSecretsStore_usesSecrets).mockReturnValue(false);

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

    const renderSave = () =>
        renderHook(() => useSaveMaterializationDraftSpec()).result.current;

    test('modifies the drafted materialization, matched by type so a rename stays in place', async () => {
        getDraftSpec.mockResolvedValue({ value: { spec: {} } });
        const specDef = materializationSpecDef();

        await expect(
            renderSave()(DRAFT_ID, MATERIALIZATION_NAME, PUB_ID, specDef)
        ).resolves.toBeNull();

        expect(modifyDraftSpec).toHaveBeenCalledWith(
            specDef,
            { draft_id: DRAFT_ID, spec_type: 'materialization' },
            MATERIALIZATION_NAME
        );
        expect(createDraftSpec).not.toHaveBeenCalled();
    });

    test('creates the materialization with its precondition when none is drafted', async () => {
        const specDef = materializationSpecDef();

        await renderSave()(DRAFT_ID, MATERIALIZATION_NAME, PUB_ID, specDef);

        expect(createDraftSpec).toHaveBeenCalledWith(
            DRAFT_ID,
            MATERIALIZATION_NAME,
            specDef,
            'materialization',
            PUB_ID
        );
        expect(modifyDraftSpec).not.toHaveBeenCalled();
    });

    test('accepts a Dekaf endpoint', async () => {
        const specDef = materializationSpecDef({
            dekaf: { variant: 'generic', config: CONFIG },
        });

        await expect(
            renderSave()(DRAFT_ID, MATERIALIZATION_NAME, PUB_ID, specDef)
        ).resolves.toBeNull();
    });

    test('rejects an unencrypted config when the task does not use secrets', async () => {
        const specDef = materializationSpecDef({
            connector: {
                image: 'materialize-postgres:dev',
                config: PLAINTEXT_CONFIG,
            },
        });

        const error = await renderSave()(
            DRAFT_ID,
            MATERIALIZATION_NAME,
            PUB_ID,
            specDef
        );

        expect(error?.message).toMatch(/must be encrypted/);
        expect(modifyDraftSpec).not.toHaveBeenCalled();
        expect(createDraftSpec).not.toHaveBeenCalled();
    });

    test('writes an unencrypted config when the task uses secrets', async () => {
        vi.mocked(useSecretsStore_usesSecrets).mockReturnValue(true);
        const specDef = materializationSpecDef({
            connector: {
                image: 'materialize-postgres:dev',
                config: PLAINTEXT_CONFIG,
            },
        });

        await expect(
            renderSave()(DRAFT_ID, MATERIALIZATION_NAME, PUB_ID, specDef)
        ).resolves.toBeNull();
        expect(createDraftSpec).toHaveBeenCalledTimes(1);
    });

    test('returns the drafted spec lookup error without writing', async () => {
        const lookupError = new Error('lookup failed');
        getDraftSpec.mockResolvedValue({ error: lookupError });

        await expect(
            renderSave()(
                DRAFT_ID,
                MATERIALIZATION_NAME,
                PUB_ID,
                materializationSpecDef()
            )
        ).resolves.toBe(lookupError);
        expect(modifyDraftSpec).not.toHaveBeenCalled();
        expect(createDraftSpec).not.toHaveBeenCalled();
    });
});
