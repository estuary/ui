import { useEditorStore_id } from 'components/editor/Store/hooks';
import useGenerateCatalog from 'components/materialization/useGenerateCatalog';
import EntityCreateSave from 'components/shared/Entity/Actions/Save';
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { CustomEvents } from 'services/logrocket';

interface Props {
    disabled: boolean;
    logEvent: CustomEvents.MATERIALIZATION_TEST;
    buttonLabelId: string;
}

function RefreshButton({ disabled, logEvent, buttonLabelId }: Props) {
    const { callFailed } = useEntityWorkflowHelpers();
    const generateCatalog = useGenerateCatalog();

    // Draft Editor Store
    const draftId = useEditorStore_id();

    return (
        <EntityCreateSave
            dryRun
            disabled={disabled}
            onFailure={callFailed}
            logEvent={logEvent}
            buttonLabelId={buttonLabelId}
            forceLogsClosed
            preSave={
                draftId
                    ? undefined
                    : () => {
                          return generateCatalog(() => {
                              console.log(
                                  'We need to call updateDraftSpecs here'
                              );
                          });
                      }
            }
        />
    );
}
export default RefreshButton;
