import { Typography } from '@mui/material';
import BindingsEditor from 'components/editor/Bindings/Editor';
import BindingSelector from 'components/editor/Bindings/Selector';
import ListAndDetails from 'components/editor/ListAndDetails';
import { useEntityWorkflow } from 'context/Workflow';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useConnectorTag from 'hooks/useConnectorTag';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { isEqual } from 'lodash';
import { useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDetailsForm_connectorImage } from 'stores/DetailsForm';
import { useFormStateStore_messagePrefix } from 'stores/FormState';
import {
    ResourceConfigDictionary,
    useResourceConfig_resourceConfig,
    useResourceConfig_setResourceSchema,
    useResourceConfig_setServerUpdateRequired,
} from 'stores/ResourceConfig';
import { Schema } from 'types';

interface Props {
    draftSpecs?: DraftSpecQuery[];
    readOnly?: boolean;
}

function BindingsMultiEditor({ draftSpecs = [], readOnly = false }: Props) {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const workflow = useEntityWorkflow();

    // Details Form Store
    const imageTag = useDetailsForm_connectorImage();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    // Resource Config Store
    const setResourceSchema = useResourceConfig_setResourceSchema();

    const resourceConfig = useResourceConfig_resourceConfig();

    const setServerUpdateRequired = useResourceConfig_setServerUpdateRequired();

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

    const resourceConfigUpdated = useMemo(() => {
        let queriedResourceConfig: ResourceConfigDictionary = {};

        draftSpecs[0]?.spec.bindings.forEach((binding: any) => {
            queriedResourceConfig = {
                ...queriedResourceConfig,
                [binding.source]: {
                    data: binding.resource,
                    errors: [],
                },
            };
        });

        // TODO (optimization): Evaluate the performance of a hash comparator function.
        return draftSpecs.length > 0
            ? !isEqual(resourceConfig, queriedResourceConfig)
            : false;
    }, [draftSpecs, resourceConfig]);

    useEffect(() => {
        if (workflow === 'materialization_edit') {
            setServerUpdateRequired(resourceConfigUpdated);
        }
    }, [setServerUpdateRequired, resourceConfigUpdated, workflow]);

    return (
        <>
            <Typography variant="h5" sx={{ mb: 1 }}>
                <FormattedMessage
                    id={`${messagePrefix}.collectionSelector.heading`}
                />
            </Typography>

            <Typography sx={{ mb: 2 }}>
                <FormattedMessage
                    id={`${messagePrefix}.collectionSelector.instructions`}
                />
            </Typography>

            <ListAndDetails
                list={<BindingSelector />}
                details={<BindingsEditor readOnly={readOnly} />}
            />
        </>
    );
}

export default BindingsMultiEditor;
