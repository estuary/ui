import type { ReactNode } from 'react';

import { Stack } from '@mui/material';

import CollectionSelectorList from 'src/components/collection/Selector/List';
import BindingSearch from 'src/components/editor/Bindings/Search';
import { useBinding_setCurrentBinding } from 'src/stores/Binding/hooks';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

interface BindingSelectorProps {
    disableSelect?: boolean;
    height?: number | string;
    hideFooter?: boolean;
    itemType?: string;
    readOnly?: boolean;
    RediscoverButton?: ReactNode;
}

function BindingSelector({
    disableSelect,
    itemType,
    hideFooter,
    readOnly,
    RediscoverButton,
}: BindingSelectorProps) {
    const formActive = useFormStateStore_isActive();
    const setCurrentBinding = useBinding_setCurrentBinding();

    const disableActions = formActive || readOnly;

    return (
        <Stack direction="column" sx={{ height: '100%' }}>
            <BindingSearch
                itemType={itemType}
                readOnly={disableActions}
                RediscoverButton={RediscoverButton}
            />

            <CollectionSelectorList
                header={itemType}
                hideFooter={hideFooter}
                disableActions={disableActions}
                setCurrentBinding={
                    !disableSelect ? setCurrentBinding : undefined
                }
            />
        </Stack>
    );
}

export default BindingSelector;
