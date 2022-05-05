import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Collapse, List, ListItem, ListItemButton } from '@mui/material';
import ResourceConfig from 'components/materialization/ResourceConfig';
import { useState } from 'react';

interface Props {
    collectionName: string;
    id: string;
}

function ExpandableResourceConfig({ collectionName, id }: Props) {
    const [expanded, setExpanded] = useState(false);

    return (
        <ListItem>
            <List>
                <ListItemButton
                    onClick={() => setExpanded(!expanded)}
                    sx={{ justifyContent: 'space-between' }}
                >
                    {collectionName}
                    <KeyboardArrowDownIcon
                        sx={{
                            marginRight: 0,
                            transform: `rotate(${expanded ? '180' : '0'}deg)`,
                            transition: 'all 250ms ease-in-out',
                        }}
                    />
                </ListItemButton>
                <ListItem>
                    <Collapse in={expanded}>
                        <ResourceConfig connectorImage={id} />
                    </Collapse>
                </ListItem>
            </List>
        </ListItem>
    );
}

export default ExpandableResourceConfig;
