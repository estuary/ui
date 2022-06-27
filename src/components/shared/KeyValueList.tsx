import { List, ListItemText } from '@mui/material';

export type KeyValue = {
    title: string;
    val?: string;
};

interface Props {
    data: KeyValue[];
    sectionTitle?: string;
}

function KeyValueList({ data, sectionTitle }: Props) {
    if (data.length > 0) {
        return (
            <List dense>
                <ListItemText primary={sectionTitle} />
                {data.map(({ title, val }, index) => (
                    <ListItemText
                        key={`${title}-keyValueList-${index}`}
                        primary={title}
                        secondary={val}
                    />
                ))}
            </List>
        );
    } else {
        return null;
    }
}

export default KeyValueList;
