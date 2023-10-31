import { Button } from '@mui/material';
import useGenerateCatalog from 'components/materialization/useGenerateCatalog';
import useSave from 'components/shared/Entity/Actions/useSave';
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useMutateDraftSpec } from 'components/shared/Entity/MutateDraftSpecContext';
import { FormattedMessage } from 'react-intl';
import { CustomEvents } from 'services/logrocket';

interface Props {
    disabled: boolean;
    logEvent: CustomEvents.MATERIALIZATION_TEST;
    buttonLabelId: string;
}

function RefreshButton({ disabled, logEvent, buttonLabelId }: Props) {
    const { callFailed } = useEntityWorkflowHelpers();

    const generateCatalog = useGenerateCatalog();
    const mutateDraftSpec = useMutateDraftSpec();
    const saveCatalog = useSave(logEvent, callFailed, true, true);

    return (
        <Button
            disabled={disabled}
            onClick={async () => {
                const evaluatedDraftId = await generateCatalog(mutateDraftSpec);

                if (!evaluatedDraftId) {
                    console.log('failed to generate');
                }

                await saveCatalog(evaluatedDraftId);
            }}
        >
            <FormattedMessage id={buttonLabelId} />
        </Button>
    );
}
export default RefreshButton;
