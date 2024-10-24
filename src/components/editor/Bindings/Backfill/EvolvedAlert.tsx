import AlertBox from 'components/shared/AlertBox';
import { useEntityType } from 'context/EntityContext';
import { useIntl } from 'react-intl';
import { ENTITY_SETTINGS } from 'settings/entity';

function EvolvedAlert() {
    const entityType = useEntityType();
    const intl = useIntl();

    return (
        <AlertBox short severity="success">
            {intl.formatMessage(
                { id: 'workflows.collectionSelector.evolvedCollections.alert' },
                {
                    itemType: intl.formatMessage({
                        id: ENTITY_SETTINGS[entityType].bindingTermId,
                    }),
                    count: 0,
                }
            )}
        </AlertBox>
    );
}

export default EvolvedAlert;
