import type { EntityTestButtonProps } from 'src/components/shared/Entity/Actions/types';

import EntityCreateSave from 'src/components/shared/Entity/Actions/Save';
import useEntitySaveHelpers from 'src/components/shared/Entity/hooks/useEntitySaveHelpers';

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
