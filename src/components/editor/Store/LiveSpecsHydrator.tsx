import {
    useEditorStore_setId,
    useEditorStore_setSpecs,
} from 'components/editor/Store/hooks';
import Error from 'components/shared/Error';
import { useEntityType } from 'context/EntityContext';
import { useLiveSpecs_details } from 'hooks/useLiveSpecs';
import EntityNotFound from 'pages/error/EntityNotFound';
import { useEffect } from 'react';
import { BaseComponentProps } from 'types';
import { hasLength } from 'utils/misc-utils';

interface Props extends BaseComponentProps {
    localZustandScope: boolean;
    catalogName: string;
}

function LiveSpecsHydrator({
    localZustandScope,
    catalogName,
    children,
}: Props) {
    const entityType = useEntityType();

    const { liveSpecs, isValidating, error } = useLiveSpecs_details(
        entityType,
        catalogName
    );

    const setSpecs = useEditorStore_setSpecs({ localScope: localZustandScope });
    const setId = useEditorStore_setId({ localScope: localZustandScope });

    useEffect(() => {
        if (hasLength(liveSpecs)) {
            setSpecs(liveSpecs);
            setId(liveSpecs[0].last_pub_id);
        }
    }, [liveSpecs, setId, setSpecs]);

    // TODO (details) make this error handling better
    // 1. Store this in the store
    // 2. Show the error but leave the proper header displaying
    if (error) {
        return <Error error={error} />;
    }

    // TODO (details) same as the error up above
    // Targetting when a user does not have access to a spec or typoed the URL
    if (!isValidating && !hasLength(liveSpecs)) {
        return <EntityNotFound catalogName={catalogName} />;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default LiveSpecsHydrator;
