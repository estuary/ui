import { ListChildComponentProps } from 'react-window';

import { ListItemText } from '@mui/material';

interface Props extends ListChildComponentProps {
    data: any;
}

// TODO (virtualization) not used right now
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
