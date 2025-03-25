import type { CatalogListContent } from 'components/transformation/create/Config/catalog/CatalogList';
import { useEditorStore_invalidEditors } from 'components/editor/Store/hooks';
import EntityList from 'components/shared/Entity/List';
import invariableStores from 'context/Zustand/invariableStores';
import { useMemo, useState } from 'react';
import { useTransformationCreate_transformConfigs } from 'stores/TransformationCreate/hooks';
import { hasLength } from 'utils/misc-utils';
import { useStore } from 'zustand';
import UpdateDraftButton from '../UpdateDraftButton';

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
