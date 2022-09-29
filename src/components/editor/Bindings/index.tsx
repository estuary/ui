import CollectionSelector from 'components/collection/Picker';
import BindingsEditor from 'components/editor/Bindings/Editor';
import BindingSelector from 'components/editor/Bindings/Selector';
import ListAndDetails from 'components/editor/ListAndDetails';
import {
    useEditorStore_editDraftId,
    useEditorStore_setId,
} from 'components/editor/Store';
import { useEntityWorkflow } from 'context/Workflow';
import useEvaluateResourceConfigChanges from 'hooks/comparisons/useEvaluateResourceConfigChanges';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useConnectorTag from 'hooks/useConnectorTag';
import { useEffect } from 'react';
import { useEffectOnce } from 'react-use';
import { useDetailsForm_connectorImage } from 'stores/DetailsForm';
import {
    useResourceConfig_resetState,
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

    const resetResourceConfigState = useResourceConfig_resetState();

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

    const resourceConfigUnchanged = useEvaluateResourceConfigChanges(
        editDraftId,
        resourceConfig
    );

    useEffect(() => {
        if (workflow === 'materialization_edit') {
            setDraftId(resourceConfigUnchanged ? editDraftId : null);
        }
    }, [setDraftId, editDraftId, resourceConfigUnchanged, workflow]);

    // TODO (placement): Consider moving this logic into the context provider
    //   once the create function for the store can be used there.
    useEffectOnce(() => {
        return () => {
            resetResourceConfigState();
        };
    });

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
