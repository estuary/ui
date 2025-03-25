import EntityCreateSave from 'components/shared/Entity/Actions/Save';
import useEntitySaveHelpers from '../hooks/useEntitySaveHelpers';
import type { EntityTestButtonProps } from './types';

function EntityTestButton({ disabled, logEvent }: EntityTestButtonProps) {
    const { buttonDisabled, formTesting, onFailure } =
        useEntitySaveHelpers(disabled);

    return (
        <EntityCreateSave
            dryRun
            disabled={buttonDisabled}
            onFailure={onFailure}
            loading={formTesting}
            logEvent={logEvent}
        />
    );
}

export default EntityTestButton;
