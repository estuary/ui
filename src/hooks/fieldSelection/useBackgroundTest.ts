import { useEffect, useRef, useState } from 'react';

import {
    useEditorStore_id,
    useEditorStore_queryResponse_draftSpecs,
} from 'src/components/editor/Store/hooks';
import { useEntityType } from 'src/context/EntityContext';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import useFieldSelectionRefresh from 'src/hooks/fieldSelection/useFieldSelectionRefresh';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBinding_serverUpdateRequired } from 'src/stores/Binding/hooks';
import { useEndpointConfig_serverUpdateRequired } from 'src/stores/EndpointConfig/hooks';
import { useFormStateStore_status } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';

export default function useBackgroundTest() {
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
        if (entityType !== 'materialization') {
            return;
        }

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
    }, [bindingUpdated, endpointConfigUpdated, formStatus, entityType]);

    useEffect(() => {
        if (entityType !== 'materialization') {
            return;
        }

        if (draftSpecs.length > 0 && formStatus === FormStatus.GENERATED) {
            if (fireBackgroundTest.current) {
                fireBackgroundTest.current = false;
                setRefreshRequired(false);
                logRocketEvent(CustomEvents.FIELD_SELECTION_REFRESH_AUTO);

                void refresh(draftId);
            }
        }
    }, [draftId, draftSpecs.length, entityType, formStatus, refresh]);

    return { refreshRequired };
}
