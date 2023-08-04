import { useEditorStore_invalidEditors } from 'components/editor/Store/hooks';
import CatalogList, {
    CatalogListContent,
} from 'components/transformation/create/Config/catalog/CatalogList';
import invariableStores from 'context/Zustand/invariableStores';
import { SyntheticEvent, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useTransformationCreate_transformConfigs } from 'stores/TransformationCreate/hooks';
import { hasLength } from 'utils/misc-utils';
import { useStore } from 'zustand';
import AddCollection from './AddCollection';
import CollectionList from './CollectionList';

function TransformList() {
    // Draft Editor Store
    const invalidEditors = useEditorStore_invalidEditors();

    // Transformation Create Store
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

    const resetSelected = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return state.resetSelected;
        }
    );

    const handlers = {
        toggleDialog: (args: SyntheticEvent | boolean) => {
            resetSelected();

            setOpen(typeof args === 'boolean' ? args : !open);
        },
    };

    return (
        <>
            <CatalogList
                content={
                    <CollectionList
                        content={content}
                        fixedAttributeType="transform"
                    />
                }
                addButtonClickHandler={handlers.toggleDialog}
                height={532}
                header={
                    <FormattedMessage id="newTransform.config.transform.header" />
                }
            />

            <AddCollection
                open={open}
                toggle={handlers.toggleDialog}
                title={
                    <FormattedMessage id="newTransform.config.transform.addDialog.header" />
                }
            />
        </>
    );
}

export default TransformList;
