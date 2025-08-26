import type { Schema } from 'src/types';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { cloneDeep, debounce, omit } from 'lodash';
import { useUnmount } from 'react-use';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'src/components/editor/Store/hooks';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_setFormState } from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import { hasLength } from 'src/utils/misc-utils';
import { formatCaptureInterval } from 'src/utils/time-utils';
import { DEFAULT_DEBOUNCE_WAIT } from 'src/utils/workflow-utils';
import { CAPTURE_INTERVAL_RE } from 'src/validation';

// TODO (capture interval) - this feature does not support two way data binding
//  with the editor. Needs to be added when we convert this over to the new
//  draftUpdater approach.
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

            let spec: Schema = cloneDeep(draftSpec.spec);
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
    useUnmount(() => {
        debounceSeverUpdate.current?.cancel();
    });

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
