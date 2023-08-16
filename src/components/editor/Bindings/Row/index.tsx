import { ListItemText } from '@mui/material';
import { typographyTruncation } from 'context/Theme';

import { stripPathing } from 'utils/misc-utils';
import BindingsSelectorRemove from './Remove';
import BindingsSelectorToggle from './Toggle';

interface RowProps {
    collection: string;
    task: string;
    disabled: boolean;
    draftId: string | null;
    hideRemove?: boolean;
    shortenName?: boolean;
}

function BindingsSelectorRow({
    collection,
    disabled,
    draftId,
    hideRemove,
    shortenName,
    task,
}: RowProps) {
    return (
        <>
            <BindingsSelectorToggle disabled={disabled} />

            <ListItemText
                primary={shortenName ? stripPathing(collection) : collection}
                primaryTypographyProps={typographyTruncation}
            />

            {hideRemove ? null : (
                <BindingsSelectorRemove
                    collection={collection}
                    task={task}
                    disabled={disabled}
                    draftId={draftId}
                />
            )}
        </>
    );
}

export default BindingsSelectorRow;
