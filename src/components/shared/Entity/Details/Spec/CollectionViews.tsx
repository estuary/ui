import {
    useBindingsEditorStore_inferSchemaResponseDoneProcessing,
    useBindingsEditorStore_populateInferSchemaResponse,
    useBindingsEditorStore_resetState,
} from 'components/editor/Bindings/Store/hooks';
import LiveSpecEditor from 'components/editor/LiveSpec';
import { useEditorStore_currentCatalog } from 'components/editor/Store/hooks';
import ReadOnly from 'components/schema/KeyAutoComplete/ReadOnly';
import PropertiesViewer from 'components/schema/PropertiesViewer';
import { SpecPresentation } from 'components/shared/Entity/Details/Spec/index';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEffect } from 'react';

interface Props {
    presentation: SpecPresentation;
}

function CollectionSpecViews({ presentation }: Props) {
    const entityType = useEntityType();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const currentCatalog = useEditorStore_currentCatalog({
        localScope: true,
    });

    const resetState = useBindingsEditorStore_resetState();

    const populateInferSchemaResponse =
        useBindingsEditorStore_populateInferSchemaResponse();

    const inferSchemaResponseDoneProcessing =
        useBindingsEditorStore_inferSchemaResponseDoneProcessing();

    useEffect(() => {
        if (entityType === 'collection' && currentCatalog) {
            populateInferSchemaResponse(currentCatalog.spec, catalogName);
        }

        return () => {
            resetState();
        };
    }, [
        catalogName,
        currentCatalog,
        entityType,
        populateInferSchemaResponse,
        resetState,
    ]);

    if (inferSchemaResponseDoneProcessing) {
        return presentation === 'table' ? (
            <>
                <ReadOnly value={currentCatalog?.spec.key} />
                <PropertiesViewer disabled />
            </>
        ) : (
            <LiveSpecEditor localZustandScope singleSpec />
        );
    } else {
        return null;
    }
}

export default CollectionSpecViews;
