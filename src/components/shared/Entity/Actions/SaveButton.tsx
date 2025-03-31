import type { EntitySaveButtonProps } from 'src/components/shared/Entity/Actions/types';

import EntityCreateSave from 'src/components/shared/Entity/Actions/Save';
import useEntitySaveHelpers from 'src/components/shared/Entity/hooks/useEntitySaveHelpers';

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
