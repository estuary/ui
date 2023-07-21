import { BaseComponentProps } from 'types';

import FullPageSpinner from 'components/fullPage/Spinner';

import { useEntityType } from 'context/EntityContext';

import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useLiveSpecsExtWithSpec } from 'hooks/useLiveSpecsExt';

import EntityNotFound from 'pages/error/EntityNotFound';

function EntityExistenceGuard({ children }: BaseComponentProps) {
    const liveSpecId = useGlobalSearchParams(GlobalSearchParams.LIVE_SPEC_ID);

    const entityType = useEntityType();

    const { liveSpecs, isValidating: checkingEntityExistence } =
        useLiveSpecsExtWithSpec(liveSpecId, entityType);

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
