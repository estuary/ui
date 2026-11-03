import type { CaptureDef } from 'deps/flow/flow';

import { renderHook } from '@testing-library/react';
import { useMutation } from 'urql';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useSaveCaptureDraftSpec } from 'src/components/capture/useSaveCaptureDraftSpec';

vi.mock(import('urql'), async (importOriginal) => ({
    ...(await importOriginal()),
    useMutation: vi.fn(),
}));

const DRAFT_ID = '1111111111111111';
const PUB_ID = '2222222222222222';
const CAPTURE_NAME = 'acmeCo/source-hello-world';

const CONFIG = { password_sops: 'ENC[...]', sops: {} };

const captureSpecDef = (): CaptureDef =>
    ({
        bindings: [],
        endpoint: {
            connector: { image: 'source-hello-world:dev', config: CONFIG },
        },
    }) as any;

const stageDraftSpecs = vi.fn();

describe('useSaveCaptureDraftSpec', () => {
    beforeEach(() => {
        stageDraftSpecs.mockReset();
        stageDraftSpecs.mockResolvedValue({
            data: { stageDraftSpecs: [CAPTURE_NAME] },
        });
        vi.mocked(useMutation).mockReturnValue([{} as never, stageDraftSpecs]);
    });

    const renderSave = () =>
        renderHook(() => useSaveCaptureDraftSpec()).result.current;

    test('stages the spec def with its precondition', async () => {
        const specDef = captureSpecDef();

        await expect(
            renderSave()(DRAFT_ID, CAPTURE_NAME, PUB_ID, specDef)
        ).resolves.toBeNull();

        expect(stageDraftSpecs).toHaveBeenCalledWith({
            draftId: DRAFT_ID,
            specs: [
                {
                    catalogName: CAPTURE_NAME,
                    catalogType: 'capture',
                    model: specDef,
                    expectPubId: PUB_ID,
                },
            ],
        });
    });

    test('rejects an endpoint that is not a connector', async () => {
        const specDef = captureSpecDef();
        specDef.endpoint = {
            local: { command: ['run'], config: {} },
        } as any;

        const error = await renderSave()(
            DRAFT_ID,
            CAPTURE_NAME,
            PUB_ID,
            specDef
        );

        expect(error?.message).toMatch(/connector or dekaf/);
        expect(stageDraftSpecs).not.toHaveBeenCalled();
    });

    test('returns the staging error', async () => {
        const stagingError = new Error('staging failed');
        stageDraftSpecs.mockResolvedValue({ error: stagingError });

        await expect(
            renderSave()(DRAFT_ID, CAPTURE_NAME, PUB_ID, captureSpecDef())
        ).resolves.toBe(stagingError);
    });
});
