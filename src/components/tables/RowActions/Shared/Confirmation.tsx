import ChipList from 'components/shared/ChipList';
import { ReactNode } from 'react';

interface RowActionConfirmationprops {
    message: ReactNode;
    selected: any; //SelectableTableStore['selected'];
}

function RowActionConfirmation({
    message,
    selected,
}: RowActionConfirmationprops) {
    return (
        <>
            {message}
            <ChipList
                items={selected.map((value: string) => value)}
                keyPrefix="confirmation-selected-items-"
            />
        </>
    );
}

export default RowActionConfirmation;
