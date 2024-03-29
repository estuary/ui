import {
    useEditorStore_setId,
    useEditorStore_setSpecs,
} from 'components/editor/Store/hooks';
import Error from 'components/shared/Error';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useLiveSpecs_spec } from 'hooks/useLiveSpecs';
import EntityNotFound from 'pages/error/EntityNotFound';
import { useEffect } from 'react';
import { BaseComponentProps } from 'types';
import { hasLength } from 'utils/misc-utils';

interface Props extends BaseComponentProps {
    localZustandScope: boolean;
    collectionNames?: string[];
}

function LiveSpecsHydrator({
    localZustandScope,
    collectionNames,
    children,
}: Props) {
    const {
        liveSpecs: publicationSpecs,
        error: pubSpecsError,
        isValidating: pubSpecsValidating,
    } = useLiveSpecs_spec(
        `editorStore-${collectionNames?.join('-')}`,
        collectionNames
    );

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const setSpecs = useEditorStore_setSpecs({ localScope: localZustandScope });
    const setId = useEditorStore_setId({ localScope: localZustandScope });

    useEffect(() => {
        if (hasLength(publicationSpecs)) {
            setSpecs(publicationSpecs);
            setId(publicationSpecs[0].last_pub_id);
        }
    }, [publicationSpecs, setId, setSpecs]);

    // TODO (details) make this error handling better
    // 1. Store this in the store
    // 2. Show the error but leave the proper header displaying
    if (pubSpecsError) {
        return <Error error={pubSpecsError} />;
    }

    // TODO (details) same as the error up above
    // Targetting when a user does not have access to a spec or typoed the URL
    if (!pubSpecsValidating && !hasLength(publicationSpecs)) {
        return <EntityNotFound catalogName={catalogName} />;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default LiveSpecsHydrator;
