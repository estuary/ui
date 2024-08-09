import {
    useEditorStore_id,
    useEditorStore_queryResponse_draftSpecs,
} from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { useEffect, useRef, useState } from 'react';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useBinding_serverUpdateRequired } from 'stores/Binding/hooks';
import { useEndpointConfig_serverUpdateRequired } from 'stores/EndpointConfig/hooks';
import { useFormStateStore_status } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { BooleanParam, useQueryParam } from 'use-query-params';
import useFieldSelectionRefresh from './useFieldSelectionRefresh';

export default function useBackgroundTest() {
    const { 1: setForcedEnable } = useQueryParam(
        GlobalSearchParams.FORCED_SHARD_ENABLE,
        BooleanParam
    );

    const entityType = useEntityType();
    const isEdit = useEntityWorkflow_Editing();

    const fireBackgroundTest = useRef(
        Boolean(entityType === 'materialization' && isEdit)
    );

    const { refresh } = useFieldSelectionRefresh();

    // Binding Store
    const bindingUpdated = useBinding_serverUpdateRequired();

    // Draft Editor Store
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const draftId = useEditorStore_id();

    // Endpoint Config Store
    const endpointConfigUpdated = useEndpointConfig_serverUpdateRequired();

    // Form State Store
    const formStatus = useFormStateStore_status();

    const [refreshRequired, setRefreshRequired] = useState(false);

    useEffect(() => {
        return () => {
            // Mainly for when a user enters edit and their initial bg test fails
            //  want to make sure we fire off another bg test if they click on
            //  next and not refresh after updating the config.
            if (
                isEdit &&
                entityType === 'materialization' &&
                formStatus === FormStatus.FAILED
            ) {
                fireBackgroundTest.current = true;
            }
        };
    }, [entityType, formStatus, isEdit]);

    useEffect(() => {
        // If we need an update at the same time we are generating then we need to show
        //  the refresh message.
        if (
            (bindingUpdated || endpointConfigUpdated) &&
            formStatus === FormStatus.GENERATING
        ) {
            setRefreshRequired(true);
        } else if (formStatus === FormStatus.TESTED) {
            // If we are here then the flag might be true and we only can stop showing it
            //  if there is a test ran. This is kinda janky as a test does not 100% guarantee
            //  a built spec but it is pretty darn close.
            setRefreshRequired(false);
        }
    }, [bindingUpdated, endpointConfigUpdated, formStatus]);

    useEffect(() => {
        if (draftSpecs.length > 0 && formStatus === FormStatus.GENERATED) {
            if (fireBackgroundTest.current) {
                // We only want to force an update if the spec is disabled. This way when a
                //  test is ran there will not be an error and the backend will connect to the
                // connector.  When the user goes to save, we will flip this back.
                const forceEnabled = Boolean(
                    draftSpecs[0].spec?.shards?.disable
                );

                // Only update the param to keep track of when we do this so if someone
                //  reloads the page their draft will get switched back properly.
                if (forceEnabled) {
                    setForcedEnable(forceEnabled);
                }

                fireBackgroundTest.current = false;
                setRefreshRequired(false);
                logRocketEvent(CustomEvents.FIELD_SELECTION_REFRESH_AUTO);

                void refresh(draftId, forceEnabled);
            }
        }
    }, [draftId, draftSpecs, formStatus, refresh, setForcedEnable]);

    return { refreshRequired };
}
