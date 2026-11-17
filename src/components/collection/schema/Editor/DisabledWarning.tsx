import AlertBox from 'src/components/shared/AlertBox';
import { useEntityType } from 'src/context/EntityContext';
import { useSchemaEvolution_autoDiscover } from 'src/stores/SchemaEvolution/hooks';

function DisabledWarning() {
    const entityType = useEntityType();

    const autoDiscover = useSchemaEvolution_autoDiscover();

    if (!autoDiscover || entityType !== 'capture') {
        return null;
    }

    return (
        <AlertBox
            sx={{ maxWidth: 'fit-content' }}
            short
            severity="warning"
            title="Editing disabled"
        >
            {
                'To edit collections, disable "Automatically keep schemas up to date" under "Schema Evolution"'
            }
        </AlertBox>
    );
}

export default DisabledWarning;
