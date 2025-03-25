import FullPageSpinner from 'components/fullPage/Spinner';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useLiveSpecsExtWithSpec } from 'hooks/useLiveSpecsExt';
import EntityNotFound from 'pages/error/EntityNotFound';
import { useEffect } from 'react';
import { useFormStateStore_setLiveSpec } from 'stores/FormState/hooks';
import type { BaseComponentProps } from 'types';

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
