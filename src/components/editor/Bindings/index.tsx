import CollectionSelector from 'components/collection/Picker';
import BindingsEditor from 'components/editor/Bindings/Editor';
import BindingSelector from 'components/editor/Bindings/Selector';
import ListAndDetails from 'components/editor/ListAndDetails';
import {
    useEditorStore_editDraftId,
    useEditorStore_setId,
} from 'components/editor/Store';
import { useEntityWorkflow } from 'context/Workflow';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useEvaluateResourceConfigUpdates from 'hooks/updates/useEvaluateResourceConfigUpdates';
import useConnectorTag from 'hooks/useConnectorTag';
import { useEffect } from 'react';
import { useDetailsForm_connectorImage } from 'stores/DetailsForm';
import {
    // ResourceConfigDictionary,
    useResourceConfig_resourceConfig,
    useResourceConfig_setResourceSchema,
} from 'stores/ResourceConfig';
import { Schema } from 'types';

interface Props {
    readOnly?: boolean;
}

function BindingsMultiEditor({ readOnly = false }: Props) {
    const [connectorId] = useGlobalSearchParams([
        GlobalSearchParams.CONNECTOR_ID,
    ]);

    const workflow = useEntityWorkflow();

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

    const resourceConfigUpdated = useEvaluateResourceConfigUpdates(
        editDraftId,
        resourceConfig
    );

    useEffect(() => {
        if (workflow === 'materialization_edit') {
            setDraftId(resourceConfigUpdated ? editDraftId : null);
        }
    }, [setDraftId, editDraftId, resourceConfigUpdated, workflow]);

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
