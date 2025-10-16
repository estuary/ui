import type { DefinedKeyProps } from 'src/components/fieldSelection/types';

import ExistingKey from 'src/components/fieldSelection/FieldActions/GroupByKeys/ExistingKey';
import { useBindingStore } from 'src/stores/Binding/Store';

const ImplicitKey = ({ bindingUUID }: DefinedKeyProps) => {
    const groupBy = useBindingStore(
        (state) =>
            state.selections?.[bindingUUID].groupBy ?? {
                explicit: [],
                implicit: [],
            }
    );

    return (
        <ExistingKey
            labelId="fieldSelection.groupBy.label.implicitKeys"
            values={groupBy.implicit}
        />
    );
};

export default ImplicitKey;
