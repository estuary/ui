import type { DefinedKeyProps } from 'src/components/fieldSelection/types';

import ExistingKey from 'src/components/fieldSelection/FieldActions/GroupByKeys/ExistingKey';
import { useBinding_groupBy } from 'src/stores/Binding/hooks';

const ImplicitKey = ({ bindingUUID }: DefinedKeyProps) => {
    const groupBy = useBinding_groupBy(bindingUUID);

    return (
        <ExistingKey
            labelId="fieldSelection.groupBy.label.implicitKeys"
            values={groupBy.implicit}
        />
    );
};

export default ImplicitKey;
