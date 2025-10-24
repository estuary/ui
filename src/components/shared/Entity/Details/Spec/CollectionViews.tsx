import type { SpecPresentation } from 'src/components/shared/Entity/Details/Spec/index';

import { useEffect } from 'react';

import {
    useBindingsEditorStore_populateSkimProjectionResponse,
    useBindingsEditorStore_resetState,
    useBindingsEditorStore_skimProjectionResponseDoneProcessing,
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

    const populateSkimProjectionResponse =
        useBindingsEditorStore_populateSkimProjectionResponse();

    const skimProjectionResponseDoneProcessing =
        useBindingsEditorStore_skimProjectionResponseDoneProcessing();

    useEffect(() => {
        if (entityType === 'collection' && currentCatalog) {
            // TODO (skim - get actual projections here)
            populateSkimProjectionResponse(
                currentCatalog.spec,
                catalogName,
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
        populateSkimProjectionResponse,
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
        return skimProjectionResponseDoneProcessing ? (
            <LiveSpecEditor localZustandScope singleSpec height={HEIGHT} />
        ) : (
            <MonacoEditorSkeleton />
        );
    }
}

export default CollectionSpecViews;
