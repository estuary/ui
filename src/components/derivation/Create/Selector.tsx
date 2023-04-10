import { BindingsSelectorSkeleton } from 'components/collection/CollectionSkeletons';
import BindingSelector from 'components/editor/Bindings/Selector';
import useLiveSpecs from 'hooks/useLiveSpecs';

function Selector() {
    const collections = useLiveSpecs('collection');

    return (
        <BindingSelector
            loading={collections.isValidating}
            skeleton={<BindingsSelectorSkeleton />}
        />
    );
}

export default Selector;
