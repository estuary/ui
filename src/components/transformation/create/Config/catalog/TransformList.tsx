import { useEditorStore_invalidEditors } from 'components/editor/Store/hooks';
import CatalogList, {
    CatalogListContent,
} from 'components/transformation/create/Config/catalog/CatalogList';
import { useLiveSpecs } from 'hooks/useLiveSpecs';
import { SyntheticEvent, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSet } from 'react-use';
import { useTransformationCreate_transformConfigs } from 'stores/TransformationCreate/hooks';
import { hasLength } from 'utils/misc-utils';
import AddCollection from './AddCollection';

function TransformList() {
    const collections = useLiveSpecs('collection');

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
    const [selectedCollectionSet, selectedCollectionSetFunctions] = useSet(
        new Set<string>([])
    );

    const handlers = {
        toggleDialog: (args: SyntheticEvent | boolean) => {
            selectedCollectionSetFunctions.reset();

            setOpen(typeof args === 'boolean' ? args : !open);
        },
    };

    return (
        <>
            <CatalogList
                fixedAttributeType="transform"
                content={content}
                addButtonClickHandler={handlers.toggleDialog}
                height={532}
            />

            <AddCollection
                collections={selectedCollectionSet}
                collectionsActions={selectedCollectionSetFunctions}
                loading={collections.isValidating}
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
