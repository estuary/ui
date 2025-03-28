import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { useEntityType } from 'src/context/EntityContext';
import { ENTITY_SETTINGS } from 'src/settings/entity';

function EvolvedAlert() {
    const entityType = useEntityType();
    const intl = useIntl();

    return (
        <AlertBox short severity="success">
            {intl.formatMessage(
                { id: 'workflows.collectionSelector.evolvedCollections.alert' },
                {
                    itemType: intl.formatMessage(
                        {
                            id: ENTITY_SETTINGS[entityType].bindingTermId,
                        },
                        {
                            count: 0,
                        }
                    ),
                }
            )}
        </AlertBox>
    );
}

export default EvolvedAlert;
