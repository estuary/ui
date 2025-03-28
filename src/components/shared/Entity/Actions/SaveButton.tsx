import useEntitySaveHelpers from '../hooks/useEntitySaveHelpers';
import { EntitySaveButtonProps } from './types';

import EntityCreateSave from 'src/components/shared/Entity/Actions/Save';

function EntitySaveButton({ logEvent, disabled }: EntitySaveButtonProps) {
    const { onFailure, buttonDisabled, formSaving } =
        useEntitySaveHelpers(disabled);

    return (
        <EntityCreateSave
            disabled={buttonDisabled}
            onFailure={onFailure}
            loading={formSaving}
            logEvent={logEvent}
        />
    );
}

export default EntitySaveButton;
