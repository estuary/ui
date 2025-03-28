import { useEffect } from 'react';

import FullPageSpinner from 'src/components/fullPage/Spinner';
import { useEntityType } from 'src/context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useLiveSpecsExtWithSpec } from 'src/hooks/useLiveSpecsExt';
import EntityNotFound from 'src/pages/error/EntityNotFound';
import { useFormStateStore_setLiveSpec } from 'src/stores/FormState/hooks';
import type { BaseComponentProps } from 'src/types';

function EntityExistenceGuard({ children }: BaseComponentProps) {
    const liveSpecId = useGlobalSearchParams(GlobalSearchParams.LIVE_SPEC_ID);

    const entityType = useEntityType();

    const setLiveSpec = useFormStateStore_setLiveSpec();

    const { liveSpecs, isValidating: checkingEntityExistence } =
        useLiveSpecsExtWithSpec(liveSpecId, entityType);

    useEffect(() => {
        if (liveSpecs.length > 0 && liveSpecs[0].spec) {
            setLiveSpec(liveSpecs[0].spec);
        }
    }, [liveSpecs, setLiveSpec]);

    if (checkingEntityExistence) {
        return <FullPageSpinner />;
    } else if (liveSpecs.length === 0) {
        return <EntityNotFound />;
    } else {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }
}

export default EntityExistenceGuard;
