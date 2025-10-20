import type { DefinedKeyProps } from 'src/components/fieldSelection/types';

import { useMemo } from 'react';

import ExistingKey from 'src/components/fieldSelection/FieldActions/GroupByKeys/ExistingKey';
import useLiveGroupByKey from 'src/hooks/fieldSelection/useLiveGroupByKey';
import { useBindingStore } from 'src/stores/Binding/Store';

const ExplicitKey = ({ bindingUUID }: DefinedKeyProps) => {
    const { existingGroupByKey } = useLiveGroupByKey(bindingUUID);

    const groupBy = useBindingStore(
        (state) =>
            state.selections?.[bindingUUID].groupBy.value ?? {
                explicit: [],
                implicit: [],
            }
    );

    const displayExplicitKeys = useMemo(
        () =>
            Boolean(
                existingGroupByKey.length > 0 &&
                    (existingGroupByKey.length !== groupBy.implicit.length ||
                        groupBy.implicit.some((field, index) =>
                            existingGroupByKey.length > index
                                ? existingGroupByKey[index] !== field
                                : false
                        ))
            ),
        [existingGroupByKey, groupBy.implicit]
    );

    if (!displayExplicitKeys) {
        return null;
    }

    return (
        <ExistingKey
            labelId="fieldSelection.groupBy.label.explicitKeys"
            values={existingGroupByKey}
        />
    );
};

export default ExplicitKey;
