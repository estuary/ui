import { Button } from '@mui/material';
import useGenerateCatalog from 'components/materialization/useGenerateCatalog';
import useSave from 'components/shared/Entity/Actions/useSave';
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useMutateDraftSpec } from 'components/shared/Entity/MutateDraftSpecContext';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { CustomEvents } from 'services/logrocket';

interface Props {
    disabled: boolean;
    logEvent: CustomEvents.MATERIALIZATION_TEST;
    buttonLabelId: string;
}

function RefreshButton({ disabled, logEvent, buttonLabelId }: Props) {
    const { callFailed } = useEntityWorkflowHelpers();

    const [updating, setUpdating] = useState(false);

    const generateCatalog = useGenerateCatalog();
    const mutateDraftSpec = useMutateDraftSpec();
    const saveCatalog = useSave(logEvent, callFailed, true, true);

    return (
        <Button
            disabled={disabled || updating}
            onClick={async () => {
                setUpdating(true);

                const evaluatedDraftId = await generateCatalog(mutateDraftSpec);

                // Make sure we have a draft id so we know the generate worked
                //  if this is not returned then the function itself handled showing an error
                if (evaluatedDraftId) {
                    await saveCatalog(evaluatedDraftId);
                }

                setUpdating(false);
            }}
        >
            <FormattedMessage id={buttonLabelId} />
        </Button>
    );
}
export default RefreshButton;
