import type { ReactNode } from 'react';

import { Stack } from '@mui/material';

import CollectionSelectorList from 'src/components/collection/Selector/List';
import BindingSearch from 'src/components/editor/Bindings/Search';
import { useBinding_setCurrentBinding } from 'src/stores/Binding/hooks';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';

interface BindingSelectorProps {
    disableSelect?: boolean;
    legacyTransformHeightHack?: number;
    hideFooter?: boolean;
    itemType?: string;
    readOnly?: boolean;
    RediscoverButton?: ReactNode;
}

// TODO (transform / legacy wrapper) we only pass in height to support the narrow version
//  of the legacy wrapper for transformation create
function BindingSelector({
    disableSelect,
    itemType,
    hideFooter,
    legacyTransformHeightHack,
    readOnly,
    RediscoverButton,
}: BindingSelectorProps) {
    const formActive = useFormStateStore_isActive();
    const setCurrentBinding = useBinding_setCurrentBinding();

    const disableActions = formActive || readOnly;

    // TODO (FireFox Height Hack) - added overflow so the scroll bar does not show up
    return (
        <Stack
            direction="column"
            sx={{
                height: legacyTransformHeightHack ?? '100%',
                overflow: 'hidden',
            }}
        >
            <BindingSearch
                itemType={itemType}
                readOnly={disableActions}
                RediscoverButton={RediscoverButton}
            />

            <CollectionSelectorList
                header={itemType}
                height={legacyTransformHeightHack ?? 570}
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
