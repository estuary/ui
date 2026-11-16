import type { LiveSpecsExtQueryWithSpec } from 'src/hooks/useLiveSpecsExt';

import { useState } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import EntityExistenceGuard from 'src/app/guards/EntityExistenceGuard';
import { useLiveSpecsExtWithSpec } from 'src/hooks/useLiveSpecsExt';

const { setLiveSpec } = vi.hoisted(() => ({ setLiveSpec: vi.fn() }));

vi.mock('src/context/EntityContext', () => ({
    useEntityType: () => 'materialization',
}));
vi.mock('src/hooks/searchParams/useGlobalSearchParams', () => ({
    default: () => 'live',
    GlobalSearchParams: { LIVE_SPEC_ID: 'liveSpecId' },
}));
vi.mock('src/hooks/useLiveSpecsExt', () => ({
    useLiveSpecsExtWithSpec: vi.fn(),
}));
vi.mock('src/stores/FormState/hooks', () => ({
    useFormStateStore_setLiveSpec: () => setLiveSpec,
}));
vi.mock('src/components/fullPage/Spinner', () => ({
    default: () => <output>Loading</output>,
}));
vi.mock('src/pages/error/EntityNotFound', () => ({
    default: () => <div>Entity not found</div>,
}));

const live: LiveSpecsExtQueryWithSpec = {
    id: 'live',
    catalog_name: 'acme/task',
    spec_type: 'materialization',
    last_pub_id: 'publication',
    reads_from: [],
    writes_to: [],
    detail: '',
    spec: { bindings: [] },
    built_spec: { bindings: [] },
};

function Editor() {
    const [value, setValue] = useState('');

    return (
        <input
            aria-label="Draft edit"
            value={value}
            onChange={(event) => setValue(event.target.value)}
        />
    );
}

const editor = () => (
    <EntityExistenceGuard>
        <Editor />
    </EntityExistenceGuard>
);

function respond(
    liveSpecs: LiveSpecsExtQueryWithSpec[],
    isValidating: boolean
) {
    vi.mocked(useLiveSpecsExtWithSpec).mockReturnValue({
        liveSpecs,
        isValidating,
        error: undefined,
        mutate: vi.fn(),
    });
}

describe('EntityExistenceGuard', () => {
    test('preserves the editor and its edits during background live-spec revalidation', () => {
        respond([live], false);
        const { rerender } = render(editor());
        const input = screen.getByRole('textbox', { name: 'Draft edit' });
        fireEvent.change(input, { target: { value: 'unsaved edit' } });

        respond([live], true);
        rerender(editor());

        expect(screen.getByRole('textbox')).toBe(input);
        expect((input as HTMLInputElement).value).toBe('unsaved edit');
        expect(screen.queryByRole('status')).toBeNull();

        respond([{ ...live, last_pub_id: 'next-publication' }], false);
        rerender(editor());
        expect(screen.getByRole('textbox')).toBe(input);
        expect((input as HTMLInputElement).value).toBe('unsaved edit');
    });

    test('waits for the initial query before showing a missing entity', () => {
        respond([], true);
        const { rerender } = render(editor());

        expect(screen.getByRole('status').textContent).toBe('Loading');
        expect(screen.queryByRole('textbox')).toBeNull();

        respond([], false);
        rerender(editor());
        expect(screen.getByText('Entity not found')).toBeTruthy();
        expect(screen.queryByRole('status')).toBeNull();
    });

    test('removes the editor when a completed refresh confirms the entity is missing', () => {
        respond([live], false);
        const { rerender } = render(editor());
        expect(screen.getByRole('textbox')).toBeTruthy();

        respond([], false);
        rerender(editor());
        expect(screen.getByText('Entity not found')).toBeTruthy();
        expect(screen.queryByRole('textbox')).toBeNull();
    });
});
