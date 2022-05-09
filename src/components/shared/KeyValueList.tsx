import { List, ListItemText } from '@mui/material';

export type KeyValue = {
    title: string;
    val: string;
};

interface Props {
    data: KeyValue[];
}

function KeyValueList({ data }: Props) {
    return (
        <List dense>
            {data.map(({ title, val }, index) => (
                <ListItemText
                    key={`${title}-keyValueList-${index}`}
                    primary={title}
                    secondary={val}
                />
            ))}
        </List>
    );
}

export default KeyValueList;
