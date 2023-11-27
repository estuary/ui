import { Button } from '@mui/material';
import useGenerateCatalog from 'components/materialization/useGenerateCatalog';
import useSave from 'components/shared/Entity/Actions/useSave';
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { CustomEvents } from 'services/types';
import { useMutateDraftSpec } from 'components/shared/Entity/MutateDraftSpecContext';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    buttonLabelId: string;
    logEvent: CustomEvents.MATERIALIZATION_TEST;
    disabled?: boolean;
}

function RefreshButton({ disabled, logEvent, buttonLabelId }: Props) {
    const { callFailed } = useEntityWorkflowHelpers();

    const [updating, setUpdating] = useState(false);

    const generateCatalog = useGenerateCatalog();
    const mutateDraftSpec = useMutateDraftSpec();
    const saveCatalog = useSave(logEvent, callFailed, true, true);

    return (
        <Button
            disabled={Boolean(updating || disabled)}
            onClick={async () => {
                setUpdating(true);

                let evaluatedDraftId;
                try {
                    evaluatedDraftId = await generateCatalog(mutateDraftSpec);
                } catch (_error: unknown) {
                    setUpdating(false);
                }

                // Make sure we have a draft id so we know the generate worked
                //  if this is not returned then the function itself handled showing an error
                if (evaluatedDraftId) {
                    try {
                        await saveCatalog(evaluatedDraftId);
                    } catch (_error: unknown) {
                        setUpdating(false);
                    }
                }

                // I do not think this is truly needed but being safe so the user is not stuck with a disabled button
                setUpdating(false);
            }}
        >
            <FormattedMessage id={buttonLabelId} />
        </Button>
    );
}
export default RefreshButton;
