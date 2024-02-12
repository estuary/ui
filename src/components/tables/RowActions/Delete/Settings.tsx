import {
    Checkbox,
    FormControl,
    FormControlLabel,
    ListItem,
} from '@mui/material';
import { useState } from 'react';
import { useIntl } from 'react-intl';

function Settings() {
    const intl = useIntl();

    const [deleteCollections, setDeleteCollections] = useState(false);

    return (
        <ListItem dense sx={{ py: 0, pl: 5 }}>
            <FormControl>
                <FormControlLabel
                    control={
                        <Checkbox
                            value="test"
                            checked={deleteCollections}
                            onChange={(event) => {
                                setDeleteCollections(event.target.checked);
                            }}
                        />
                    }
                    label={intl.formatMessage({
                        id: 'capturesTable.delete.removeCollectionsOption',
                    })}
                />
            </FormControl>
        </ListItem>
    );
}

export default Settings;
