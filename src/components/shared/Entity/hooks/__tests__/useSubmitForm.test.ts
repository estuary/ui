import type * as DraftGeneration from 'src/hooks/drafts/useGenerateDraftSpec';
import type { CaptureDraftSpec } from 'src/hooks/drafts/useGetDraftSpec';

import { act, renderHook } from '@testing-library/react';

import { useSubmitCaptureForm } from 'src/components/capture/useSubmitCaptureForm';
import { useSubmitMaterializationForm } from 'src/components/materialization/useSubmitMaterializationForm';
import { useBindingStore } from 'src/stores/Binding/Store';

vi.mock('src/components/capture/useStartDiscover', () => ({
    useStartDiscover: () => startDiscover,
}));
vi.mock('src/components/editor/Store/hooks', () => ({
    useEditorStore_persistedDraftId: () => 'draft-id',
    useEditorStore_resetState: () => vi.fn(),
    useEditorStore_setCatalogName: () => vi.fn(),
}));
vi.mock('src/components/shared/Entity/hooks/useApplyDraftToWorkflow', () => ({
    useApplyDraftToWorkflow: () => applyDraft,
}));
vi.mock('src/components/shared/Entity/hooks/useEncryptEndpointConfig', () => ({
    useEncryptEndpointConfig: () => async () => ({ value: {} }),
}));
vi.mock('src/components/shared/Entity/hooks/useEntityWorkflowHelpers', () => ({
    default: () => ({ callFailed }),
}));
vi.mock('src/components/shared/Entity/hooks/useValidateWorkflowForms', () => ({
    useValidateWorkflowForms: () => () => true,
}));
vi.mock('src/components/shared/Entity/MutateDraftSpecContext', () => ({
    useMutateDraftSpec: () => mutateDraftSpec,
}));
vi.mock('src/hooks/drafts/useCreateDraft', () => ({
    useCreateDraft: () => createDraft,
}));
vi.mock('src/hooks/drafts/useGenerateDraftSpec', () => ({
    useGenerateDraftSpec: () => generateDraftSpec,
}));
vi.mock('src/hooks/drafts/useGetDraftSpec', () => ({
    useGetDraftSpec: () => getDraftSpec,
}));
vi.mock('src/hooks/drafts/useSaveDraftSpec', () => ({
    useSaveDraftSpec: () => saveDraftSpec,
}));
vi.mock('src/stores/FormState/hooks', () => ({
    useFormStateStore_updateStatus: () => vi.fn(),
}));

const applyDraft = vi.fn();
const callFailed = vi.fn();
const createDraft = vi.fn();
const generateDraftSpec = vi.fn();
const getDraftSpec = vi.fn();
const mutateDraftSpec = vi.fn();
const saveDraftSpec = vi.fn();
const startDiscover = vi.fn();

beforeEach(() => {
    getDraftSpec.mockResolvedValue({
        value: { spec: { bindings: [] }, expect_pub_id: 'publication-id' },
    });
});

describe('submit with an unresolved authored binding', () => {
    const associationError = new Error('The authored binding changed.');

    beforeEach(() => {
        generateDraftSpec.mockImplementation(() => {
            throw associationError;
        });
    });

    afterEach(() => {
        expect(generateDraftSpec).toHaveBeenCalledOnce();
        expect(saveDraftSpec).not.toHaveBeenCalled();
        expect(createDraft).not.toHaveBeenCalled();
        expect(mutateDraftSpec).not.toHaveBeenCalled();
        expect(applyDraft).not.toHaveBeenCalled();
        expect(startDiscover).not.toHaveBeenCalled();
    });

    test('capture reports the generation error and returns false', async () => {
        const { result } = renderHook(() => useSubmitCaptureForm());

        await expect(result.current()).resolves.toBe(false);

        expect(callFailed).toHaveBeenCalledExactlyOnceWith({
            error: {
                title: 'captureCreate.generate.failedErrorTitle',
                error: associationError,
            },
        });
    });

    test('materialization reports the generation error and rejects', async () => {
        const { result } = renderHook(() => useSubmitMaterializationForm());

        await expect(result.current()).rejects.toBeNull();

        expect(callFailed).toHaveBeenCalledExactlyOnceWith({
            error: {
                title: 'materializationCreate.generate.failure.errorTitle',
                error: associationError,
            },
        });
    });
});

test('capture submit refreshes authored indices before mutate and the next generation', async () => {
    const endpoint = { image: 'source-test:dev', config: {} };
    const bindings = ['a', 'b', 'c'].map((table, index) => ({
        target: 'acme/shared',
        resource: { table, _meta: { path: ['public', table] } },
        backfill: index + 2,
    }));
    const existing: CaptureDraftSpec = {
        expect_pub_id: 'publication-id',
        spec: { endpoint: { connector: endpoint }, bindings },
    };
    const saved: CaptureDraftSpec = {
        ...existing,
        spec: { ...existing.spec, bindings: [bindings[2], bindings[0]] },
    };
    useBindingStore
        .getState()
        .prefillBindingDependentState('capture', [], bindings);
    getDraftSpec.mockResolvedValue({ value: existing });
    generateDraftSpec.mockReturnValue(saved);
    saveDraftSpec.mockResolvedValue({ value: saved });
    mutateDraftSpec.mockImplementation(async () => {
        expect(
            Object.values(useBindingStore.getState().resourceConfigs).map(
                ({ data, meta }) => ({
                    table: data.table,
                    index: meta.bindingIndex,
                })
            )
        ).toEqual([
            { table: 'c', index: 0 },
            { table: 'a', index: 1 },
        ]);
        expect(applyDraft).not.toHaveBeenCalled();
    });
    const { result } = renderHook(() => useSubmitCaptureForm());

    await act(async () => {
        await expect(result.current()).resolves.toBe(true);
    });

    expect(saveDraftSpec.mock.calls[0][2]).toEqual(saved);
    expect(mutateDraftSpec).toHaveBeenCalledOnce();
    expect(applyDraft).toHaveBeenCalledOnce();
    expect(callFailed).not.toHaveBeenCalled();
    expect(startDiscover).not.toHaveBeenCalled();

    const { useGenerateDraftSpec: useActualGenerator } = await vi.importActual<
        typeof DraftGeneration
    >('src/hooks/drafts/useGenerateDraftSpec');
    const generate = renderHook(() => useActualGenerator('capture')).result
        .current;
    const state = useBindingStore.getState();

    expect(
        generate(saved, endpoint, state.resourceConfigs, state.bindings).spec
            .bindings
    ).toEqual(saved.spec.bindings);
});
