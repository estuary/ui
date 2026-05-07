import type {
    BaseComponentProps,
    SourceCaptureDef,
    TargetNamingStrategy,
} from 'src/types';

import { useCallback, useEffect, useRef } from 'react';

import { TargetNamingFormContent } from 'src/components/materialization/targetNaming/FormContent';
import { useConfirmationModalContext } from 'src/context/Confirmation';
import { useConnectorTag_nullable } from 'src/context/ConnectorTag';
import { useEntityType } from 'src/context/EntityContext';
import {
    useEntityWorkflow,
    useEntityWorkflow_Editing,
} from 'src/context/Workflow';
import useTargetNaming from 'src/hooks/materialization/useTargetNaming';
import useSourceCapture from 'src/hooks/sourceCapture/useSourceCapture';
import useTrialPrefixes from 'src/hooks/trialStorage/useTrialPrefixes';
import { logRocketConsole } from 'src/services/shared';
import {
    useBinding_hydrated,
    useBinding_hydrateState,
    useBinding_setActive,
    useBinding_setHydrated,
    useBinding_setHydrationErrorsExist,
} from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { hasLength } from 'src/utils/misc-utils';

export const BindingHydrator = ({ children }: BaseComponentProps) => {
    // We want to manually control this in a REF to not fire extra effect calls
    const rehydrating = useRef(false);

    const entityType = useEntityType();

    const workflow = useEntityWorkflow();
    const editWorkflow = useEntityWorkflow_Editing();

    const getTrialPrefixes = useTrialPrefixes();

    const connectorTagState = useConnectorTag_nullable();

    const hydrated = useBinding_hydrated();
    const setHydrated = useBinding_setHydrated();
    const setHydrationErrorsExist = useBinding_setHydrationErrorsExist();
    const setActive = useBinding_setActive();
    const hydrateState = useBinding_hydrateState();

    const setPrefilledCapture = useSourceCaptureStore(
        (state) => state.setPrefilledCapture
    );

    // These callbacks may change between renders; use a ref so the effect
    // closure always calls the latest version without re-running the effect.
    const confirmationContext = useConfirmationModalContext();
    const { handleConfirm } = useTargetNaming();
    const { updateDraft } = useSourceCapture();

    const callbacksRef = useRef({
        confirmationContext,
        handleConfirm,
        updateDraft,
    });
    callbacksRef.current = { confirmationContext, handleConfirm, updateDraft };

    const pendingStrategyRef = useRef<TargetNamingStrategy>({
        strategy: 'matchSourceStructure',
    });
    const handleNamingChange = useCallback(
        (strategy: TargetNamingStrategy, isValid: boolean) => {
            pendingStrategyRef.current = strategy;
            callbacksRef.current.confirmationContext?.setContinueAllowed(
                isValid
            );
        },
        []
    );

    useEffect(() => {
        if (workflow && connectorTagState) {
            const connectorTag = connectorTagState.applicable
                ? connectorTagState.data
                : null;

            setActive(true);

            // TODO (Workflow Hydrator) - when moving bindings into the parent hydrator
            //  make sure that we allow resetting everything in the store except for the bindings
            //  themselves. That way `hydrateState` won't have to call `resetState` with a bunch of flags... hopefully
            hydrateState(
                editWorkflow,
                entityType,
                connectorTag,
                getTrialPrefixes,
                rehydrating.current
            )
                .then(
                    async (response) => {
                        if (!response || response.length === 0) return;

                        // Build the collection list and find the source capture
                        const allCollections: string[] = [];
                        let captureName: string | null = null;

                        for (const entry of response) {
                            if (entry.spec_type === 'capture') {
                                if (!captureName)
                                    captureName = entry.catalog_name;
                                for (const col of entry.writes_to ?? []) {
                                    if (!allCollections.includes(col))
                                        allCollections.push(col);
                                }
                            } else {
                                if (
                                    !allCollections.includes(entry.catalog_name)
                                )
                                    allCollections.push(entry.catalog_name);
                            }
                        }

                        const { resourceConfigPointers } =
                            useBindingStore.getState();
                        const targetSchemaSupported = hasLength(
                            resourceConfigPointers?.x_schema_name
                        );

                        if (
                            !editWorkflow &&
                            targetSchemaSupported &&
                            allCollections.length > 0
                        ) {
                            // When prefilling we need to prompt the user to provide
                            //  us with their targetNaming strategy before continuing
                            //  so the prefilled bindings are populated correctly

                            const {
                                confirmationContext: ctx,
                                handleConfirm: confirm,
                                updateDraft: writeDraft,
                            } = callbacksRef.current;

                            pendingStrategyRef.current = {
                                strategy: 'matchSourceStructure',
                            };

                            const confirmed = await ctx?.showConfirmation(
                                {
                                    title: 'destinationLayout.dialog.title',
                                    confirmText:
                                        'destinationLayout.dialog.cta.addBindings',
                                    dialogProps: { maxWidth: 'md' },
                                    message: (
                                        <TargetNamingFormContent
                                            initialStrategy={null}
                                            exampleCollections={allCollections}
                                            onChange={handleNamingChange}
                                        />
                                    ),
                                },
                                true
                            );

                            if (confirmed) {
                                const sourceCaptureDef:
                                    | SourceCaptureDef
                                    | undefined = captureName
                                    ? { capture: captureName }
                                    : undefined;

                                await confirm(
                                    pendingStrategyRef.current,
                                    () => {
                                        useBindingStore
                                            .getState()
                                            .prefillResourceConfigs(
                                                allCollections,
                                                true,
                                                sourceCaptureDef,
                                                pendingStrategyRef.current
                                            );
                                        if (captureName) {
                                            void writeDraft(captureName);
                                            setPrefilledCapture(captureName);
                                        }
                                    }
                                );
                            }
                        } else {
                            // Fallback: preserve old behavior for edit workflows or
                            // connectors without root target naming support.
                            useBindingStore
                                .getState()
                                .addEmptyBindings(
                                    response,
                                    rehydrating.current
                                );
                            if (captureName && !editWorkflow) {
                                setPrefilledCapture(captureName);
                            }
                        }
                    },
                    (error) => {
                        logRocketConsole(
                            'Failed to hydrate binding-dependent views',
                            error
                        );

                        setHydrationErrorsExist(true);
                    }
                )
                .finally(() => {
                    rehydrating.current = true;
                    setHydrated(true);

                    setActive(false);
                });
        }
    }, [
        connectorTagState,
        editWorkflow,
        entityType,
        getTrialPrefixes,
        handleNamingChange,
        hydrateState,
        setActive,
        setHydrated,
        setHydrationErrorsExist,
        setPrefilledCapture,
        workflow,
    ]);

    if (!hydrated) {
        return null;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default BindingHydrator;
