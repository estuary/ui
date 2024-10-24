import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import { debounce, omit } from 'lodash';
import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { logRocketConsole } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useBindingStore } from 'stores/Binding/Store';
import { useFormStateStore_setFormState } from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { Schema } from 'types';
import { formatCaptureInterval, hasLength } from 'utils/misc-utils';
import { DEFAULT_DEBOUNCE_WAIT } from 'utils/workflow-utils';
import {
    CAPTURE_INTERVAL_RE,
    NUMERIC_RE,
    POSTGRES_INTERVAL_RE,
} from 'validation';

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
                logRocketConsole(CustomEvents.CAPTURE_INTERVAL_ERROR, {
                    draftIdMissing: !draftId,
                    draftSpecMissing: !draftSpec,
                    mutateMissing: !mutateDraftSpecs,
                });

                return Promise.resolve();
            }

            let spec: Schema = draftSpec.spec;

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
                    logRocketConsole(CustomEvents.CAPTURE_INTERVAL_ERROR, {
                        interval,
                        formattedInterval,
                    });

                    return Promise.resolve();
                }

                spec.interval = formattedInterval;
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

    const updateStoredInterval = (
        input: string,
        unit: string,
        setUnit?: Dispatch<SetStateAction<string>>
    ) => {
        const trimmedInput = input.trim();

        const postgresIntervalFormat = POSTGRES_INTERVAL_RE.test(trimmedInput);
        const captureIntervalFormat = CAPTURE_INTERVAL_RE.test(trimmedInput);

        const unitlessInterval =
            !hasLength(trimmedInput) ||
            postgresIntervalFormat ||
            captureIntervalFormat;

        if (
            setUnit &&
            hasLength(trimmedInput) &&
            (postgresIntervalFormat || captureIntervalFormat)
        ) {
            setUnit('i');
        }

        if (unitlessInterval || NUMERIC_RE.test(trimmedInput)) {
            const interval = unitlessInterval
                ? trimmedInput
                : `${trimmedInput}${unit}`;

            setCaptureInterval(interval);
            debounceSeverUpdate.current();
        }
    };

    useEffect(() => {
        if (typeof captureInterval === 'string' && serverUpdateRequired) {
            setServerUpdateRequired(false);

            applyCaptureInterval(captureInterval).then(
                () => {
                    setFormState({ status: FormStatus.UPDATED });
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
