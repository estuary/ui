import { Button } from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import { useEditorStore_specs } from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { getPathWithParams } from 'utils/misc-utils';

function EditButton() {
    const navigate = useNavigate();

    const entityType = useEntityType();

    const spec = useEditorStore_specs({ localScope: true });

    console.log('spec', spec);

    const connectorId = '';
    const liveSpec = '';
    const lastPubId = '';

    const editPath = useMemo(() => {
        switch (entityType) {
            case 'materialization':
                return authenticatedRoutes.materializations.edit.fullPath;
            default:
                return authenticatedRoutes.captures.edit.fullPath;
        }
    }, [entityType]);

    const goToEdit = useCallback(() => {
        navigate(
            getPathWithParams(editPath, {
                [GlobalSearchParams.CONNECTOR_ID]: connectorId,
                [GlobalSearchParams.LIVE_SPEC_ID]: liveSpec,
                [GlobalSearchParams.LAST_PUB_ID]: lastPubId,
            })
        );
    }, [editPath, navigate]);

    // We currently do not allow users to edit derivations so just return nothing
    if (entityType === 'collection') {
        return null;
    }

    return (
        <Button onClick={goToEdit}>
            <FormattedMessage id="cta.edit" />
        </Button>
    );
}

export default EditButton;
