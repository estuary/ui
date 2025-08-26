import { Box } from '@mui/material';

import { useIntl } from 'react-intl';

import { DataGridRowSkeleton } from 'src/components/collection/CollectionSkeletons';
import AlertBox from 'src/components/shared/AlertBox';
import { useEntityType } from 'src/context/EntityContext';
import { ENTITY_SETTINGS } from 'src/settings/entity';
import { useBinding_hydrated } from 'src/stores/Binding/hooks';

function SelectorEmpty() {
    const intl = useIntl();
    const entityType = useEntityType();
    const hydrated = useBinding_hydrated();

    return hydrated ? (
        <Box sx={{ pt: 1, px: 1 }}>
            <AlertBox
                severity="warning"
                short
                title={intl.formatMessage({
                    id: ENTITY_SETTINGS[entityType].workFlows
                        .bindingsEmptyTitleIntlKey,
                })}
            >
                {intl.formatMessage({
                    id: ENTITY_SETTINGS[entityType].workFlows
                        .bindingsEmptyMessageIntlKey,
                })}
            </AlertBox>
        </Box>
    ) : (
        <>
            <DataGridRowSkeleton
                opacity={0.75}
                contentWidth="80%"
                endButton
                showBorder
            />

            <DataGridRowSkeleton
                opacity={0.5}
                contentWidth="80%"
                endButton
                showBorder
            />

            <DataGridRowSkeleton
                opacity={0.25}
                contentWidth="80%"
                endButton
                showBorder
            />
        </>
    );
}

export default SelectorEmpty;
