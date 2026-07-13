import { useEffect } from 'react';

import { Box, Button } from '@mui/material';

import { Refresh } from 'iconoir-react';
import { useIntl } from 'react-intl';

import { useEditorStore_persistedDraftId } from 'src/components/editor/Store/hooks';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

interface Props {
    buttonLabel: string;
    refresh: Function;
}

function RefreshButton({ buttonLabel, refresh }: Props) {
    const selectionsHydrating = useBindingStore((state) =>
        Object.values(state.selections).some(({ hydrating }) => hydrating)
    );

    const persistedDraftId = useEditorStore_persistedDraftId();

    const formActive = useFormStateStore_isActive();

    useEffect(() => {
        logRocketEvent(CustomEvents.FIELD_SELECTION, {
            hydrating: selectionsHydrating,
        });
    }, [selectionsHydrating]);

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
                {buttonLabel}
            </Button>
        </Box>
    );
}

/** @deprecated Prefer the named `RefreshButton` export */
function RefreshButtonWrapper({
    buttonLabelId,
    ...props
}: Omit<Props, 'buttonLabel'> & { buttonLabelId: string }) {
    const intl = useIntl();

    return (
        <RefreshButton
            {...props}
            buttonLabel={intl.formatMessage({ id: buttonLabelId })}
        />
    );
}

export default RefreshButtonWrapper;
