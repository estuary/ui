import { Box, Button } from '@mui/material';

import { Refresh } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import { useEditorStore_persistedDraftId } from 'src/components/editor/Store/hooks';
import useFieldSelectionRefresh from 'src/hooks/fieldSelection/useFieldSelectionRefresh';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

interface Props {
    buttonLabelId: string;
}

function RefreshButton({ buttonLabelId }: Props) {
    const { refresh } = useFieldSelectionRefresh();

    const selectionsHydrating = useBindingStore((state) =>
        Object.values(state.selections).some(({ hydrating }) => hydrating)
    );

    const persistedDraftId = useEditorStore_persistedDraftId();

    const formActive = useFormStateStore_isActive();

    return (
        <Box>
            <Button
                disabled={Boolean(
                    selectionsHydrating || formActive || !persistedDraftId
                )}
                startIcon={<Refresh style={{ fontSize: 12 }} />}
                variant="text"
                onClick={() => {
                    logRocketEvent(CustomEvents.FIELD_SELECTION_REFRESH_MANUAL);
                    void refresh();
                }}
            >
                <FormattedMessage id={buttonLabelId} />
            </Button>
        </Box>
    );
}
export default RefreshButton;
