import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { ReactNode } from 'react';

export type KeyValue = {
    title: string | ReactNode;
    val?: string | ReactNode;
};

interface Props {
    data: KeyValue[];
    disableTypography?: boolean;
    sectionTitle?: string;
}

function KeyValueList({ data, disableTypography, sectionTitle }: Props) {
    if (data.length > 0) {
        return (
            <>
                {sectionTitle ? (
                    <Typography variant="subtitle1">{sectionTitle}</Typography>
                ) : null}
                <List
                    dense
                    sx={{ ml: 2, pt: 0, overflow: 'auto', maxHeight: 300 }}
                >
                    {data.map(({ title, val }, index) => (
                        <ListItem key={`${title}-keyValueList-${index}`}>
                            <ListItemText
                                disableTypography={disableTypography}
                                primary={title}
                                secondary={val}
                            />
                        </ListItem>
                    ))}
                </List>
            </>
        );
    } else {
        return null;
    }
}

export default KeyValueList;
