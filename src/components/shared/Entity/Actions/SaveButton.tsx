import { EditorStoreState } from 'components/editor/Store';
import EntityCreateSave from 'components/shared/Entity/Actions/Save';
import LogDialog from 'components/shared/Entity/LogDialog';
import LogDialogActions from 'components/shared/Entity/LogDialogActions';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import {
    CaptureStoreNames,
    MaterializationStoreNames,
    useZustandStore,
} from 'hooks/useZustand';
import { FormattedMessage } from 'react-intl';
import { entityCreateStoreSelectors, FormStatus } from 'stores/Create';

interface Props {
    closeLogs: Function;
    callFailed: Function;
    disabled: boolean;
    draftEditorStoreName:
        | CaptureStoreNames.DRAFT_SPEC_EDITOR
        | MaterializationStoreNames.DRAFT_SPEC_EDITOR;
    materialize?: Function;
}

function EntitySaveButton({
    callFailed,
    closeLogs,
    disabled,
    draftEditorStoreName,
    materialize,
}: Props) {
    const useEntityCreateStore = useRouteStore();
    const showLogs = useEntityCreateStore(
        entityCreateStoreSelectors.formState.showLogs
    );
    const logToken = useEntityCreateStore(
        entityCreateStoreSelectors.formState.logToken
    );
    const formStatus = useEntityCreateStore(
        entityCreateStoreSelectors.formState.status
    );
    const messagePrefix = useEntityCreateStore(
        entityCreateStoreSelectors.messagePrefix
    );

    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >(draftEditorStoreName, (state) => state.id);

    return (
        <>
            <LogDialog
                open={
                    (formStatus === FormStatus.SAVING ||
                        formStatus === FormStatus.SAVED) &&
                    showLogs
                }
                token={logToken}
                title={
                    <FormattedMessage
                        id={`${messagePrefix}.save.waitMessage`}
                    />
                }
                actionComponent={
                    <LogDialogActions
                        close={closeLogs}
                        materialize={
                            materialize
                                ? {
                                      action: materialize,
                                      title: `${messagePrefix}.ctas.materialize`,
                                  }
                                : undefined
                        }
                    />
                }
            />
            <EntityCreateSave
                disabled={disabled || !draftId}
                onFailure={callFailed}
                draftEditorStoreName={draftEditorStoreName}
            />
        </>
    );
}

export default EntitySaveButton;
