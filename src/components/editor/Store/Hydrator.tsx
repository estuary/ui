import {
    useEditorStore_setId,
    useEditorStore_setSpecs,
} from 'components/editor/Store/hooks';
import Error from 'components/shared/Error';
import { useLiveSpecs_spec } from 'hooks/useLiveSpecs';
import { useEffect } from 'react';
import { BaseComponentProps } from 'types';
import { hasLength } from 'utils/misc-utils';

interface Props extends BaseComponentProps {
    lastPubId: string;
    localZustandScope: boolean;
    collectionNames?: string[];
}

function Hydrator({
    lastPubId,
    localZustandScope,
    collectionNames,
    children,
}: Props) {
    const { liveSpecs: publicationSpecs, error: pubSpecsError } =
        useLiveSpecs_spec(
            `editorandlogs-${collectionNames?.join('-')}`,
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

    if (pubSpecsError) {
        return <Error error={pubSpecsError} />;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default Hydrator;
