import { useEffect } from 'react';

import { BaseComponentProps } from 'types';

import {
    useEditorStore_setId,
    useEditorStore_setSpecs,
} from 'components/editor/Store/hooks';
import Error from 'components/shared/Error';

import { useLiveSpecs_spec } from 'hooks/useLiveSpecs';

import { hasLength } from 'utils/misc-utils';

interface Props extends BaseComponentProps {
    lastPubId: string;
    localZustandScope: boolean;
    collectionNames?: string[];
}

function LiveSpecsHydrator({
    lastPubId,
    localZustandScope,
    collectionNames,
    children,
}: Props) {
    const { liveSpecs: publicationSpecs, error: pubSpecsError } =
        useLiveSpecs_spec(
            `editorStore-${collectionNames?.join('-')}`,
            collectionNames
        );

    const setSpecs = useEditorStore_setSpecs({ localScope: localZustandScope });
    const setId = useEditorStore_setId({ localScope: localZustandScope });

    useEffect(() => {
        setId(lastPubId);
    }, [lastPubId, setId]);

    useEffect(() => {
        if (hasLength(publicationSpecs)) {
            setSpecs(publicationSpecs);
        }
    }, [publicationSpecs, setSpecs]);

    // TODO (details) make this error handling better
    // 1. Store this in the store
    // 2. Show the error but leave the proper header displaying
    if (pubSpecsError) {
        return <Error error={pubSpecsError} />;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default LiveSpecsHydrator;
