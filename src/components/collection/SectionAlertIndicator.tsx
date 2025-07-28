import { Typography, useTheme } from '@mui/material';

import { WarningCircle } from 'iconoir-react';
import { useIntl } from 'react-intl';

import {
    useBinding_bindingErrorsExist,
    useBinding_fullSourceErrorsExist,
    useBinding_hasFieldConflicts,
    useBinding_hydrationErrorsExist,
    useBinding_resourceConfigErrorsExist,
} from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_messagePrefix } from 'src/stores/FormState/hooks';

export default function SectionAlertIndicator() {
    const intl = useIntl();
    const theme = useTheme();

    // Binding Store
    const bindingHydrationErrorsExist = useBinding_hydrationErrorsExist();
    const resourceConfigErrorsExist = useBinding_resourceConfigErrorsExist();
    const bindingErrorsExist = useBinding_bindingErrorsExist();
    const fullSourceErrorsExist = useBinding_fullSourceErrorsExist();
    const sourceBackfillRecommended = useBindingStore((state) =>
        Object.values(state.collectionMetadata).some(
            (meta) => meta.sourceBackfillRecommended
        )
    );
    const fieldConflictsExist = useBinding_hasFieldConflicts();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    const hasErrors =
        bindingHydrationErrorsExist ||
        resourceConfigErrorsExist ||
        fullSourceErrorsExist ||
        fieldConflictsExist;

    const hasWarnings = bindingErrorsExist || sourceBackfillRecommended;

    return (
        <>
            {hasErrors || hasWarnings ? (
                <WarningCircle
                    style={{
                        marginRight: 8,
                        fontSize: 12,
                        color: hasErrors
                            ? theme.palette.error.main
                            : theme.palette.warning.main,
                    }}
                />
            ) : null}

            <Typography variant="subtitle1">
                {intl.formatMessage({
                    id: `${messagePrefix}.collections.heading`,
                })}
            </Typography>
        </>
    );
}
