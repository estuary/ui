import { ListItemText } from '@mui/material';
import { typographyTruncation } from 'context/Theme';
import { stripPathing } from 'utils/misc-utils';

interface RowProps {
    collection: string;
    shortenName?: boolean;
}

function BindingsSelectorName({ collection, shortenName }: RowProps) {
    return (
        <ListItemText
            primary={shortenName ? stripPathing(collection) : collection}
            primaryTypographyProps={typographyTruncation}
        />
    );
}

export default BindingsSelectorName;
