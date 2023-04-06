import { ListItemText } from '@mui/material';
import { ListChildComponentProps } from 'react-window';

interface Props extends ListChildComponentProps {
    data: any;
}

function KeyValueListRow({ data, index, style }: Props) {
    const { title, val } = data;

    return (
        <ListItemText
            style={style}
            key={`${title}-keyValueList-${index}`}
            primary={title}
            secondary={val}
        />
    );
}

export default KeyValueListRow;
