import { List, ListItem, Typography } from '@mui/material';

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
                <ListItem key={`${title}-keyValueList-${index}`}>
                    <Typography>{title}</Typography>
                    {val}
                </ListItem>
            ))}
        </List>
    );
}

export default KeyValueList;
