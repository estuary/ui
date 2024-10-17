import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import { omit } from 'lodash';
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { useBindingStore } from 'stores/Binding/Store';
import { Schema } from 'types';
import { formatPostgresInterval, hasLength } from 'utils/misc-utils';
import { NUMERIC_RE, POSTGRES_INTERVAL_RE } from 'validation';

export default function useCaptureInterval() {
    // Binding Store
    const interval = useBindingStore((state) => state.captureInterval);
    const setInterval = useBindingStore((state) => state.setCaptureInterval);

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const updateStoredInterval = (
        input: string,
        unit: string,
        setUnit?: Dispatch<SetStateAction<string>>
    ) => {
        const postgresIntervalFormat = POSTGRES_INTERVAL_RE.test(input);
        const unitlessInterval = !hasLength(input) || postgresIntervalFormat;

        if (setUnit && postgresIntervalFormat) {
            setUnit('');
        }

        if (unitlessInterval || NUMERIC_RE.test(input)) {
            setInterval(unitlessInterval ? input : `${input}${unit}`);
        }
    };

    const draftSpec = useMemo(
        () =>
            draftSpecs.length > 0 && draftSpecs[0].spec ? draftSpecs[0] : null,
        [draftSpecs]
    );

    const applyCaptureInterval = useCallback(async () => {
        if (!mutateDraftSpecs || !draftSpec) {
            return Promise.reject();
        }

        const spec: Schema = draftSpec.spec;

        if (!hasLength(interval)) {
            omit(spec, 'interval');
        } else {
            spec.interval = formatPostgresInterval(interval);
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
    }, [draftId, draftSpec, interval, mutateDraftSpecs]);

    return { applyCaptureInterval, updateStoredInterval };
}
