import { Paper, Typography } from '@mui/material';
import DraftSpecEditor from 'components/editor/DraftSpec';
import { EditorStoreState } from 'components/editor/Store';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import {
    DetailsFormStoreNames,
    DraftEditorStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { FormattedMessage } from 'react-intl';
import { DetailsFormState } from 'stores/DetailsForm';

interface Props {
    messageId: string;
    draftEditorStoreName: DraftEditorStoreNames;
    detailsFormStoreName: DetailsFormStoreNames;
}

function CatalogEditor({
    messageId,
    draftEditorStoreName,
    detailsFormStoreName,
}: Props) {
    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >(draftEditorStoreName, (state) => state.id);

    const formActive = useZustandStore<
        DetailsFormState,
        DetailsFormState['isActive']
    >(detailsFormStoreName, (state) => state.isActive);

    if (draftId) {
        return (
            <WrapperWithHeader
                header={
                    <FormattedMessage id="entityCreate.catalogEditor.heading" />
                }
            >
                <>
                    <Typography sx={{ mb: 2 }}>
                        <FormattedMessage id={messageId} />
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 1 }}>
                        <DraftSpecEditor
                            draftEditorStoreName={draftEditorStoreName}
                            disabled={formActive}
                        />
                    </Paper>
                </>
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default CatalogEditor;
