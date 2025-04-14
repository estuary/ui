import type { ReactNode } from 'react';

import { Box } from '@mui/material';

import CollectionSelectorList from 'src/components/collection/Selector/List';
import BindingSearch from 'src/components/editor/Bindings/Search';
import { useBinding_setCurrentBinding } from 'src/stores/Binding/hooks';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

interface BindingSelectorProps {
    disableSelect?: boolean;
    height?: number | string;
    itemType?: string;
    readOnly?: boolean;
    RediscoverButton?: ReactNode;
}

function BindingSelector({
    disableSelect,
    height,
    itemType,
    readOnly,
    RediscoverButton,
}: BindingSelectorProps) {
    const formActive = useFormStateStore_isActive();
    const setCurrentBinding = useBinding_setCurrentBinding();

    const disableActions = formActive || readOnly;

    return (
        <Box
            sx={{
                height,
            }}
        >
            <BindingSearch
                itemType={itemType}
                readOnly={disableActions}
                RediscoverButton={RediscoverButton}
            />

            <CollectionSelectorList
                header={itemType}
                disableActions={disableActions}
                setCurrentBinding={
                    !disableSelect ? setCurrentBinding : undefined
                }
            />
        </Box>
    );
}

export default BindingSelector;
