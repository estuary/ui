import useEntitySaveHelpers from '../hooks/useEntitySaveHelpers';
import { EntityTestButtonProps } from './types';

import EntityCreateSave from 'src/components/shared/Entity/Actions/Save';

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
