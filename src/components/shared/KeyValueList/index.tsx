import type { ReactNode } from 'react';

import { List, ListItem, ListItemText, Typography } from '@mui/material';

import { diminishedTextColor } from 'src/context/Theme';

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

                <List dense sx={{ pt: 0, overflowY: 'auto' }}>
                    {data.map(({ title, val }, index) => (
                        <ListItem
                            key={`${title}-keyValueList-${index}`}
                            style={{ paddingLeft: 0, paddingRight: 0 }}
                        >
                            <ListItemText
                                disableTypography={disableTypography}
                                primary={title}
                                secondary={val}
                                primaryTypographyProps={{
                                    color: (theme) =>
                                        diminishedTextColor[theme.palette.mode],
                                    component: 'div',
                                    marginBottom: '2px',
                                }}
                                secondaryTypographyProps={{
                                    color: (theme) =>
                                        theme.palette.text.primary,
                                    component: 'div',
                                }}
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
