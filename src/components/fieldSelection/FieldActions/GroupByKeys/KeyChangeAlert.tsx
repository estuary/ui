import type { KeyChangeAlertProps } from 'src/components/fieldSelection/types';
import type { MaterializationBuiltBinding } from 'src/types/schemaModels';

import { useMemo } from 'react';

import { Typography } from '@mui/material';

import { isEmpty } from 'lodash';
import { useIntl } from 'react-intl';

import { useEditorStore_liveBuiltSpec } from 'src/components/editor/Store/hooks';
import AlertBox from 'src/components/shared/AlertBox';
import { useBindingStore } from 'src/stores/Binding/Store';

const KeyChangeAlert = ({ bindingUUID }: KeyChangeAlertProps) => {
    const intl = useIntl();

    const backfilledBindings = useBindingStore(
        (state) => state.backfilledBindings
    );
    const selectionsExist = useBindingStore(
        (state) => !isEmpty(state.selections?.[bindingUUID].value)
    );
    const draftedGroupByKeys = useBindingStore((state) => {
        if (bindingUUID && !state.selections?.[bindingUUID]) {
            return [];
        }

        return state.selections[bindingUUID].groupBy.explicit.length > 0
            ? state.selections[bindingUUID].groupBy.explicit
            : state.selections[bindingUUID].groupBy.implicit;
    });

    const liveBuiltBindingIndex = useBindingStore(
        (state) =>
            state.resourceConfigs?.[bindingUUID].meta.liveBuiltBindingIndex ??
            -1
    );

    const liveBuiltSpec = useEditorStore_liveBuiltSpec();

    const backfillRequired = useMemo(() => {
        const liveBuiltBinding: MaterializationBuiltBinding | undefined =
            liveBuiltBindingIndex > -1
                ? liveBuiltSpec?.bindings.at(liveBuiltBindingIndex)
                : undefined;

        const liveGroupByKeys: string[] =
            liveBuiltBinding?.fieldSelection.keys ?? [];

        return (
            selectionsExist &&
            !backfilledBindings.includes(bindingUUID) &&
            (liveGroupByKeys.length !== draftedGroupByKeys.length ||
                liveGroupByKeys.some((key, index) =>
                    index < draftedGroupByKeys.length
                        ? draftedGroupByKeys[index] !== key
                        : false
                ))
        );
    }, [
        backfilledBindings,
        bindingUUID,
        draftedGroupByKeys,
        liveBuiltBindingIndex,
        liveBuiltSpec,
        selectionsExist,
    ]);

    if (!backfillRequired) {
        return null;
    }

    return (
        <AlertBox severity="warning" short>
            <Typography>
                {intl.formatMessage({
                    id: 'fieldSelection.groupBy.alert.backfillRequired',
                })}
            </Typography>
        </AlertBox>
    );
};

export default KeyChangeAlert;
