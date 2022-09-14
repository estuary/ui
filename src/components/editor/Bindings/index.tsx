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
import useConnectorTag from 'hooks/useConnectorTag';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import {
    LiveSpecsExtQueryWithSpec,
    useLiveSpecsExtByLastPubId,
    useLiveSpecsExtWithOutSpec,
} from 'hooks/useLiveSpecsExt';
import { isEmpty, isEqual } from 'lodash';
import { useEffect } from 'react';
import { useDetailsForm_connectorImage } from 'stores/DetailsForm';
import {
    ResourceConfigDictionary,
    useResourceConfig_preFillCollections,
    useResourceConfig_preFillEmptyCollections,
    useResourceConfig_resourceConfig,
    useResourceConfig_setResourceConfig,
    useResourceConfig_setResourceSchema,
} from 'stores/ResourceConfig';
import { ENTITY, Schema } from 'types';

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
    const workflow = useEntityWorkflow();

    const [liveSpecId, lastPubId] = useGlobalSearchParams([
        GlobalSearchParams.LIVE_SPEC_ID,
        GlobalSearchParams.LAST_PUB_ID,
    ]);

    // Details Form Store
    const imageTag = useDetailsForm_connectorImage();

    // Draft Editor Store
    const setDraftId = useEditorStore_setId();

    const editDraftId = useEditorStore_editDraftId();

    // Resource Config Store
    const setResourceSchema = useResourceConfig_setResourceSchema();

    const resourceConfig = useResourceConfig_resourceConfig();
    const setResourceConfig = useResourceConfig_setResourceConfig();

    const prefillEmptyCollections = useResourceConfig_preFillEmptyCollections();

    const preFillCollections = useResourceConfig_preFillCollections();

    const { liveSpecs } = useLiveSpecsExtWithOutSpec(
        liveSpecId,
        ENTITY.CAPTURE
    );
    const { liveSpecs: liveSpecsByLastPub } = useLiveSpecsExtByLastPubId(
        lastPubId,
        ENTITY.CAPTURE
    );

    const { connectorTag } = useConnectorTag(imageTag.id);

    useEffect(() => {
        console.log('1: outer');
        if (connectorTag?.resource_spec_schema) {
            console.log('1: inner');

            setResourceSchema(
                connectorTag.resource_spec_schema as unknown as Schema
            );
        }
    }, [setResourceSchema, connectorTag?.resource_spec_schema]);

    useEffect(() => {
        console.log('2: outer');
        if (
            workflow === 'capture_create' ||
            workflow === 'materialization_create'
        ) {
            console.log('2: inner');

            if (liveSpecs.length > 0) {
                prefillEmptyCollections(liveSpecs);
            } else if (liveSpecsByLastPub.length > 0) {
                prefillEmptyCollections(liveSpecsByLastPub);
            }
        }
    }, [prefillEmptyCollections, liveSpecs, liveSpecsByLastPub, workflow]);

    useEffect(() => {
        console.log('3: outer');
        if (editWorkflow && isEmpty(resourceConfig)) {
            console.log('3: inner');

            const { initialSpec } = editWorkflow;

            initialSpec.spec.bindings.forEach((binding: any) =>
                setResourceConfig(binding.source, {
                    data: binding.resource,
                    errors: [],
                })
            );

            preFillCollections([initialSpec]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    // useEffect(() => {
    //     if (workflow === 'materialization_edit' && editWorkflow) {
    //         const { initialSpec, draftSpecs } = editWorkflow;

    //         if (hasLength(draftSpecs)) {
    //             if (isEmpty(resourceConfig)) {
    //                 initialSpec.spec.bindings.forEach((binding: any) =>
    //                     setResourceConfig(binding.source, {
    //                         data: binding.resource,
    //                         errors: [],
    //                     })
    //                 );

    //                 preFillCollections([initialSpec]);
    //             } else {
    //                 setDraftId(
    //                     evaluateResourceConfigEquality(resourceConfig, [
    //                         initialSpec,
    //                         draftSpecs[0],
    //                     ])
    //                         ? editDraftId
    //                         : null
    //                 );
    //             }
    //         }
    //     }
    // });

    // useEffect(() => {
    //     if (connectorTag?.resource_spec_schema) {
    //         setResourceSchema(
    //             connectorTag.resource_spec_schema as unknown as Schema
    //         );

    //         // We wanna make sure we do these after the schemas are set as
    //         //  as they are dependent on them.
    //         if (
    //             workflow === 'capture_create' ||
    //             workflow === 'materialization_create'
    //         ) {
    //             if (liveSpecs.length > 0) {
    //                 prefillEmptyCollections(liveSpecs);
    //             } else if (liveSpecsByLastPub.length > 0) {
    //                 prefillEmptyCollections(liveSpecsByLastPub);
    //             }
    //         } else if (workflow === 'materialization_edit' && editWorkflow) {
    //             const { initialSpec, draftSpecs } = editWorkflow;

    //             if (hasLength(draftSpecs)) {
    //                 if (isEmpty(resourceConfig)) {
    //                     initialSpec.spec.bindings.forEach((binding: any) =>
    //                         setResourceConfig(binding.source, {
    //                             data: binding.resource,
    //                             errors: [],
    //                         })
    //                     );

    //                     preFillResourceConfigAndCollections([initialSpec]);
    //                 } else {
    //                     setDraftId(
    //                         evaluateResourceConfigEquality(resourceConfig, [
    //                             initialSpec,
    //                             draftSpecs[0],
    //                         ])
    //                             ? editDraftId
    //                             : null
    //                     );
    //                 }
    //             }
    //         }
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [
    //     preFillResourceConfigAndCollections,
    //     prefillEmptyCollections,
    //     setDraftId,
    //     setResourceConfig,
    //     setResourceSchema,
    //     computedResourceConfig,
    //     connectorTag?.resource_spec_schema,
    //     editDraftId,
    //     // liveSpecs,
    //     // liveSpecsByLastPub,
    //     // resourceConfig,
    //     // workflow,
    //     // editWorkflow,
    // ]);

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
