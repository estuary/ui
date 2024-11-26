import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import { debounce, omit } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useBindingStore } from 'stores/Binding/Store';
import { useFormStateStore_setFormState } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { Schema } from 'types';
import { hasLength } from 'utils/misc-utils';
import { formatCaptureInterval } from 'utils/time-utils';
import { DEFAULT_DEBOUNCE_WAIT } from 'utils/workflow-utils';
import { CAPTURE_INTERVAL_RE } from 'validation';

export default function useCaptureInterval() {
    // Binding Store
    const captureInterval = useBindingStore((state) => state.captureInterval);
    const setCaptureInterval = useBindingStore(
        (state) => state.setCaptureInterval
    );

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    // Form State Store
    const setFormState = useFormStateStore_setFormState();

    const [serverUpdateRequired, setServerUpdateRequired] = useState(false);

    const draftSpec = useMemo(
        () =>
            draftSpecs.length > 0 && draftSpecs[0].spec ? draftSpecs[0] : null,
        [draftSpecs]
    );

    const applyCaptureInterval = useCallback(
        async (interval: string) => {
            if (!mutateDraftSpecs || !draftId || !draftSpec) {
                logRocketEvent(
                    `${CustomEvents.CAPTURE_INTERVAL} : missing critical resources to update draft`,
                    {
                        draftIdMissing: !draftId,
                        draftSpecMissing: !draftSpec,
                        mutateMissing: !mutateDraftSpecs,
                    }
                );

                return Promise.resolve();
            }

            let spec: Schema = draftSpec.spec;
            const originalInterval = draftSpec.spec?.interval;

            if (!hasLength(interval)) {
                spec = omit(spec, 'interval');
            } else {
                const strippedInterval = interval.endsWith('i')
                    ? interval.slice(0, interval.length - 1)
                    : interval;

                const formattedInterval =
                    formatCaptureInterval(strippedInterval);

                if (
                    !formattedInterval ||
                    !CAPTURE_INTERVAL_RE.test(formattedInterval)
                ) {
                    logRocketEvent(
                        `${CustomEvents.CAPTURE_INTERVAL} : incorrect interval format`,
                        {
                            interval,
                            formattedInterval,
                        }
                    );

                    return Promise.resolve();
                }

                spec.interval = formattedInterval;
            }

            if (originalInterval === spec.interval) {
                return Promise.resolve();
            }

            const updateResponse = await modifyDraftSpec(spec, {
                draft_id: draftId,
                catalog_name: draftSpec.catalog_name,
                spec_type: 'capture',
            });

            if (updateResponse.error) {
                return Promise.reject(updateResponse.error);
            }

            return mutateDraftSpecs();
        },
        [draftId, draftSpec, mutateDraftSpecs]
    );

    const debounceSeverUpdate = useRef(
        debounce(() => {
            setServerUpdateRequired(true);
        }, DEFAULT_DEBOUNCE_WAIT)
    );

    const updateStoredInterval = (input: string) => {
        const trimmedInput = input.trim();

        if (
            !hasLength(trimmedInput) ||
            CAPTURE_INTERVAL_RE.test(trimmedInput)
        ) {
            setCaptureInterval(trimmedInput);
            debounceSeverUpdate.current();
        }
    };

    useEffect(() => {
        if (typeof captureInterval === 'string' && serverUpdateRequired) {
            setServerUpdateRequired(false);

            applyCaptureInterval(captureInterval).then(
                () => {
                    setFormState({ status: FormStatus.UPDATED, error: null });
                },
                (error) => {
                    if (error) {
                        setFormState({
                            status: FormStatus.FAILED,
                            error: {
                                title: 'captureInterval.error.updateFailed',
                                error,
                            },
                        });
                    }
                }
            );
        }
    }, [
        applyCaptureInterval,
        captureInterval,
        serverUpdateRequired,
        setFormState,
        setServerUpdateRequired,
    ]);

    return { updateStoredInterval };
}
