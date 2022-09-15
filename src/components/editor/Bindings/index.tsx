import CollectionSelector from 'components/collection/Picker';
import BindingsEditor from 'components/editor/Bindings/Editor';
import BindingSelector from 'components/editor/Bindings/Selector';
import ListAndDetails from 'components/editor/ListAndDetails';
import {
    useEditorStore_editDraftId,
    useEditorStore_setId,
} from 'components/editor/Store';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useConnectorTag from 'hooks/useConnectorTag';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { LiveSpecsExtQueryWithSpec } from 'hooks/useLiveSpecsExt';
import { isEmpty, isEqual } from 'lodash';
import { useEffect } from 'react';
import { useDetailsForm_connectorImage } from 'stores/DetailsForm';
import {
    ResourceConfigDictionary,
    useResourceConfig_resourceConfig,
    useResourceConfig_setResourceSchema,
} from 'stores/ResourceConfig';
import { Schema } from 'types';

interface Props {
    readOnly?: boolean;
    editWorkflow?: {
        initialSpec: LiveSpecsExtQueryWithSpec;
        draftSpecs: DraftSpecQuery[];
    };
}

const evaluateResourceConfigEquality = (
    resourceConfig: ResourceConfigDictionary,
    queries: any[]
) => {
    const configEquality: boolean[] = queries.map((query) => {
        let queriedResourceConfig: ResourceConfigDictionary = {};

        query.spec.bindings.forEach((binding: any) => {
            queriedResourceConfig = {
                ...queriedResourceConfig,
                [binding.source]: {
                    data: binding.resource,
                    errors: [],
                },
            };
        });

        return isEqual(resourceConfig, queriedResourceConfig);
    });

    return configEquality.includes(true);
};

function BindingsMultiEditor({ readOnly = false, editWorkflow }: Props) {
    const [connectorId] = useGlobalSearchParams([
        GlobalSearchParams.CONNECTOR_ID,
    ]);

    // Details Form Store
    const imageTag = useDetailsForm_connectorImage();

    // Draft Editor Store
    const setDraftId = useEditorStore_setId();

    const editDraftId = useEditorStore_editDraftId();

    // Resource Config Store
    const setResourceSchema = useResourceConfig_setResourceSchema();

    const resourceConfig = useResourceConfig_resourceConfig();

    const { connectorTag } = useConnectorTag(imageTag.id);

    useEffect(() => {
        if (
            connectorId !== connectorTag?.connector_id &&
            connectorTag?.resource_spec_schema
        ) {
            setResourceSchema(
                connectorTag.resource_spec_schema as unknown as Schema
            );
        }
    }, [
        setResourceSchema,
        connectorId,
        connectorTag?.connector_id,
        connectorTag?.resource_spec_schema,
    ]);

    useEffect(() => {
        console.log('4: outer');
        if (editWorkflow && !isEmpty(resourceConfig)) {
            console.log('4: inner');

            const { initialSpec, draftSpecs } = editWorkflow;

            setDraftId(
                evaluateResourceConfigEquality(resourceConfig, [
                    initialSpec,
                    draftSpecs[0],
                ])
                    ? editDraftId
                    : null
            );
        }
    }, [setDraftId, editDraftId, editWorkflow, resourceConfig]);

    return (
        <>
            <CollectionSelector readOnly={readOnly} />

            <ListAndDetails
                list={<BindingSelector />}
                details={<BindingsEditor readOnly={readOnly} />}
            />
        </>
    );
}

export default BindingsMultiEditor;
