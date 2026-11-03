import type { MaterializationDef } from 'deps/flow/flow';

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { createDraftSpec, modifyDraftSpec } from 'src/api/draftSpecs';
import { useSaveMaterializationDraftSpec } from 'src/components/materialization/useSaveMaterializationDraftSpec';
import { useGetDraftSpec } from 'src/hooks/drafts/useGetDraftSpec';

vi.mock(import('src/api/draftSpecs'), async (importOriginal) => ({
    ...(await importOriginal()),
    createDraftSpec: vi.fn(),
    modifyDraftSpec: vi.fn(),
}));

vi.mock(import('src/hooks/drafts/useGetDraftSpec'), async (importOriginal) => ({
    ...(await importOriginal()),
    useGetDraftSpec: vi.fn(),
}));

const DRAFT_ID = '1111111111111111';
const PUB_ID = '2222222222222222';
const MATERIALIZATION_NAME = 'acmeCo/materialize-postgres';

const CONFIG = { password_sops: 'ENC[...]', sops: {} };

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
