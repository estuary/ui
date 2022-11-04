import { Typography, useTheme } from '@mui/material';
import {
    BindingsEditorSkeleton,
    BindingsSelectorSkeleton,
} from 'components/collection/CollectionSkeletons';
import BindingsEditor from 'components/editor/Bindings/Editor';
import BindingSelector from 'components/editor/Bindings/Selector';
import ListAndDetails from 'components/editor/ListAndDetails';
import { useEntityType } from 'context/EntityContext';
import { alternativeReflexContainerBackground } from 'context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useConnectorTag from 'hooks/useConnectorTag';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import useLiveSpecs from 'hooks/useLiveSpecs';
import { isEqual } from 'lodash';
import { useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDetailsForm_connectorImage } from 'stores/DetailsForm';
import { useFormStateStore_messagePrefix } from 'stores/FormState';
import {
    useResourceConfig_resourceConfig,
    useResourceConfig_setResourceSchema,
    useResourceConfig_setServerUpdateRequired,
} from 'stores/ResourceConfig/hooks';
import { ResourceConfigDictionary } from 'stores/ResourceConfig/types';
import { Schema } from 'types';

interface Props {
    draftSpecs: DraftSpecQuery[];
    readOnly?: boolean;
}

function BindingsMultiEditor({ draftSpecs = [], readOnly = false }: Props) {
    const theme = useTheme();

    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const entityType = useEntityType();

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

        const collectionNameProp =
            entityType === 'materialization' ? 'source' : 'target';

        draftSpecs[0]?.spec.bindings.forEach((binding: any) => {
            queriedResourceConfig = {
                ...queriedResourceConfig,
                [binding[collectionNameProp]]: {
                    data: binding.resource,
                    errors: [],
                },
            };
        });

        return draftSpecs.length > 0
            ? !isEqual(resourceConfig, queriedResourceConfig)
            : false;
    }, [draftSpecs, entityType, resourceConfig]);

    useEffect(() => {
        setServerUpdateRequired(resourceConfigUpdated);
    }, [setServerUpdateRequired, resourceConfigUpdated]);

    const { liveSpecs } = useLiveSpecs('collection');

    const fetchingSpecs =
        entityType === 'materialization'
            ? liveSpecs.length === 0
            : draftSpecs.length === 0;

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
                list={
                    <BindingSelector
                        loading={fetchingSpecs}
                        skeleton={<BindingsSelectorSkeleton />}
                        readOnly={readOnly}
                    />
                }
                details={
                    <BindingsEditor
                        loading={fetchingSpecs}
                        skeleton={<BindingsEditorSkeleton />}
                        readOnly={readOnly}
                    />
                }
                backgroundColor={
                    alternativeReflexContainerBackground[theme.palette.mode]
                }
                displayBorder={true}
            />
        </>
    );
}

export default BindingsMultiEditor;
