import { Box } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { DataGridRowSkeleton } from 'src/components/collection/CollectionSkeletons';
import AlertBox from 'src/components/shared/AlertBox';
import { useBinding_hydrated } from 'src/stores/Binding/hooks';

function SelectorEmpty() {
    const hydrated = useBinding_hydrated();

    return hydrated ? (
        <Box sx={{ pt: 1, px: 1 }}>
            <AlertBox
                severity="warning"
                short
                title={
                    <FormattedMessage id="entityCreate.bindingsConfig.noRowsTitle" />
                }
            >
                <FormattedMessage id="entityCreate.bindingsConfig.noRows" />
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
