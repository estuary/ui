import type { ReactNode } from 'react';

import {
    List,
    ListItem,
    ListItemText,
    Typography,
    useTheme,
} from '@mui/material';

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
    const theme = useTheme();
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
                            style={
                                val
                                    ? { paddingLeft: 0, paddingRight: 0 }
                                    : undefined
                            }
                        >
                            <ListItemText
                                disableTypography={disableTypography}
                                primary={title}
                                secondary={val}
                                primaryTypographyProps={{
                                    color: val
                                        ? diminishedTextColor[
                                              theme.palette.mode
                                          ]
                                        : theme.palette.text.primary,
                                    component: 'div',
                                    marginBottom: val ? '2px' : undefined,
                                }}
                                secondaryTypographyProps={{
                                    color: theme.palette.text.primary,
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
