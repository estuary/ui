import type { DefinedKeyProps } from 'src/components/fieldSelection/types';

import { useMemo } from 'react';

import ExistingKey from 'src/components/fieldSelection/FieldActions/GroupByKeys/ExistingKey';
import useLiveGroupByKey from 'src/hooks/fieldSelection/useLiveGroupByKey';
import { useBinding_groupBy } from 'src/stores/Binding/hooks';

const ExplicitKey = ({ bindingUUID }: DefinedKeyProps) => {
    const { existingGroupByKey } = useLiveGroupByKey(bindingUUID);

    const groupBy = useBinding_groupBy(bindingUUID);

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
