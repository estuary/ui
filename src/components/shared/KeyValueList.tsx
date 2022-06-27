import { List, ListItemText, Typography } from '@mui/material';

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
            <>
                {sectionTitle ? (
                    <Typography variant="subtitle1">{sectionTitle}</Typography>
                ) : null}
                <List dense sx={{ ml: 2, pt: 0 }}>
                    {data.map(({ title, val }, index) => (
                        <ListItemText
                            key={`${title}-keyValueList-${index}`}
                            primary={title}
                            secondary={val}
                        />
                    ))}
                </List>
            </>
        );
    } else {
        return null;
    }
}

export default KeyValueList;
