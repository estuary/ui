import type { CatalogListContent } from 'src/components/transformation/create/Config/catalog/CatalogList';

import { useMemo, useState } from 'react';

import { useStore } from 'zustand';

import { useEditorStore_invalidEditors } from 'src/components/editor/Store/hooks';
import EntityList from 'src/components/shared/Entity/List';
import UpdateDraftButton from 'src/components/transformation/create/Config/UpdateDraftButton';
import invariableStores from 'src/context/Zustand/invariableStores';
import { useTransformationCreate_transformConfigs } from 'src/stores/TransformationCreate/hooks';
import { hasLength } from 'src/utils/misc-utils';

function TransformList() {
    const resetSelected = useStore(
        invariableStores['Entity-Selector-Table'],
        (state) => {
            return state.resetSelected;
        }
    );
    const invalidEditors = useEditorStore_invalidEditors();
    const transformConfigs = useTransformationCreate_transformConfigs();
    const content: CatalogListContent[] = useMemo(
        () =>
            Object.entries(transformConfigs).map(
                ([attributeId, { name, lambda }]) => ({
                    attributeId,
                    value: name,
                    editorInvalid:
                        !hasLength(lambda) ||
                        invalidEditors.includes(attributeId),
                })
            ),
        [invalidEditors, transformConfigs]
    );

    const [open, setOpen] = useState<boolean>(false);

    const toggleDialog = (args: any) => {
        resetSelected();

        setOpen(typeof args === 'boolean' ? args : !open);
    };

    return (
        <EntityList
            content={content}
            entity="collection"
            PrimaryCTA={UpdateDraftButton}
            toggle={toggleDialog}
        />
    );
}

export default TransformList;
