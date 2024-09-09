import EntityCreateSave from 'components/shared/Entity/Actions/Save';
import useEntitySaveHelpers from '../hooks/useEntitySaveHelpers';
import { EntitySaveButtonProps } from './types';

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
