import type { SpecPresentation } from 'src/components/shared/Entity/Details/Spec/index';

import { useEffect } from 'react';

import {
    useBindingsEditorStore_inferSchemaResponseDoneProcessing,
    useBindingsEditorStore_populateInferSchemaResponse,
    useBindingsEditorStore_resetState,
} from 'src/components/editor/Bindings/Store/hooks';
import LiveSpecEditor from 'src/components/editor/LiveSpec';
import { MonacoEditorSkeleton } from 'src/components/editor/MonacoEditor/EditorSkeletons';
import { useEditorStore_currentCatalog } from 'src/components/editor/Store/hooks';
import ReadOnly from 'src/components/schema/KeyAutoComplete/ReadOnly';
import PropertiesViewer from 'src/components/schema/PropertiesViewer';
import { HEIGHT } from 'src/components/shared/Entity/Details/History/shared';
import { useEntityType } from 'src/context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';

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

    console.log('currentCatalog', currentCatalog);

    useEffect(() => {
        if (entityType === 'collection' && currentCatalog) {
            populateInferSchemaResponse(
                currentCatalog.spec,
                catalogName,
                currentCatalog.spec,
                {}
            );
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

    if (presentation === 'table') {
        return (
            <>
                <ReadOnly value={currentCatalog?.spec.key} />

                <PropertiesViewer disabled />
            </>
        );
    } else {
        return inferSchemaResponseDoneProcessing ? (
            <LiveSpecEditor localZustandScope singleSpec height={HEIGHT} />
        ) : (
            <MonacoEditorSkeleton />
        );
    }
}

export default CollectionSpecViews;
