import AlertBox from 'src/components/shared/AlertBox';
import { useEntityType } from 'src/context/EntityContext';
import { BINDING_TERMS } from 'src/settings/entity';

function EvolvedAlert() {
    const entityType = useEntityType();
    const [, bindingTermPlural] = BINDING_TERMS[entityType];

    return (
        <AlertBox short severity="success">
            {`Reversioned ${bindingTermPlural} will backfill on their own`}
        </AlertBox>
    );
}

export default EvolvedAlert;
