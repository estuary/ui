import { Button } from '@mui/material';
import invariableStores from 'context/Zustand/invariableStores';

import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';

import { useStore } from 'zustand';

interface Props {
    onChange: any;
    setDialogOpen: Dispatch<SetStateAction<boolean>>;
}

function PrimaryCTA({ onChange, setDialogOpen }: Props) {
    const [selected] = useStore(
        invariableStores['Collections-Selector-Table'],
        (state) => {
            return [state.selected];
        }
    );

    const close = () => {
        setDialogOpen(false);
        onChange(
            Array.from(selected).map((collection) => {
                return {
                    name: collection[0],
                };
            })
        );
    };

    return (
        <Button
            variant="contained"
            disabled={selected.size < 1}
            onClick={close}
        >
            <FormattedMessage id="cta.continue" />
        </Button>
    );
}

export default PrimaryCTA;
