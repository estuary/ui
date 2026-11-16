import type { ResourceConfig as ResourceConfigState } from 'src/stores/Binding/types';

import { render } from '@testing-library/react';

import ResourceConfig from 'src/components/collection/ResourceConfig';
import AdvancedOptions from 'src/components/editor/Bindings/AdvancedOptions';
import Backfill from 'src/components/editor/Bindings/Backfill';
import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import { useBinding_resourceConfig } from 'src/stores/Binding/hooks';

vi.mock('src/context/EntityContext', () => ({
    useEntityType: () => 'capture',
}));
vi.mock('src/components/editor/Store/hooks', () => ({
    useEditorStore_queryResponse_draftSpecs: vi.fn(),
}));
vi.mock('src/stores/Binding/hooks', () => ({
    useBinding_resourceConfig: vi.fn(),
    useBinding_hydrated: () => false,
    useBinding_collectionMetadataProperty: () => false,
    useBinding_resourceConfigOfMetaBindingProperty: () => false,
}));
vi.mock('src/components/editor/Bindings/AdvancedOptions', () => ({
    default: vi.fn(() => null),
}));
vi.mock('src/components/editor/Bindings/Backfill', () => ({
    default: vi.fn(() => null),
}));
vi.mock('src/components/collection/ResourceConfigForm', () => ({
    default: () => null,
}));
vi.mock('src/components/fieldSelection/FieldSelectionViewer', () => ({
    default: () => null,
}));
vi.mock('src/components/materialization/TrialOnlyPrefixAlert', () => ({
    default: () => null,
}));

const collectionName = 'acme/collection';

describe('resource configuration authored binding selection', () => {
    test.each([
        ['existing matching resource', 'b', false, 1],
        ['new binding with a colliding provisional index', 'b', true, -1],
        ['unsaved resource edit', 'changed', false, -1],
    ] as const)('%s', (_name, table, added, expectedIndex) => {
        const config: ResourceConfigState = {
            data: { table },
            errors: [],
            meta: {
                added,
                bindingIndex: 1,
                builtBindingIndex: -1,
                liveBindingIndex: -1,
                liveBuiltBindingIndex: -1,
                validatedBindingIndex: -1,
                collectionName,
            },
        };
        vi.mocked(useBinding_resourceConfig).mockReturnValue(config);
        vi.mocked(useEditorStore_queryResponse_draftSpecs).mockReturnValue([
            {
                catalog_name: 'acme/task',
                spec_type: 'capture',
                draft_id: 'draft',
                expect_pub_id: 'publication',
                spec: {
                    bindings: ['a', 'b'].map((resourceTable) => ({
                        target: collectionName,
                        resource: { table: resourceTable },
                    })),
                },
                built_spec: null,
                validated: null,
            },
        ]);

        render(
            <ResourceConfig
                bindingUUID="binding-b"
                collectionName={collectionName}
                refreshRequired={false}
                refresh={vi.fn()}
            />
        );

        expect(useBinding_resourceConfig).toHaveBeenCalledWith('binding-b');
        expect(
            vi.mocked(AdvancedOptions).mock.calls.at(-1)?.[0].bindingIndex
        ).toBe(expectedIndex);
        expect(vi.mocked(Backfill).mock.calls.at(-1)?.[0].bindingIndex).toBe(
            expectedIndex
        );
    });
});
