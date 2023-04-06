import { List, Typography } from '@mui/material';
import KeyValueListRow from './Row';
import VirtualizedKeyValueList from './Virtualized';

export type KeyValue = {
    title: string;
    val?: string;
};

interface Props {
    data: KeyValue[];
    sectionTitle?: string;
    virtualized?: boolean;
}

function KeyValueList({ data, sectionTitle, virtualized }: Props) {
    if (data.length > 0) {
        return (
            <>
                {sectionTitle ? (
                    <Typography variant="subtitle1">{sectionTitle}</Typography>
                ) : null}
                {virtualized ? (
                    <VirtualizedKeyValueList data={data} />
                ) : (
                    <List dense sx={{ ml: 2, pt: 0 }}>
                        {data.map((datum, index) => (
                            <KeyValueListRow
                                key={`keyValueList-${index}`}
                                data={datum}
                                index={index}
                                style={{}}
                            />
                        ))}
                    </List>
                )}
            </>
        );
    } else {
        return null;
    }
}

export default KeyValueList;
