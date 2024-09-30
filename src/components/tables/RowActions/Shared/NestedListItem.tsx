import {
    Checkbox,
    FormControl,
    FormControlLabel,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import { useZustandStore } from 'context/Zustand/provider';
import { useIntl } from 'react-intl';
import {
    SelectableTableStore,
    TableActionSettings,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { SelectTableStoreNames } from 'stores/names';

export interface SettingMetadata {
    messageId: string;
    setting: keyof TableActionSettings;
}

interface Props {
    catalogName: string;
    selectableTableStoreName:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.COLLECTION
        | SelectTableStoreNames.ENTITY_SELECTOR
        | SelectTableStoreNames.MATERIALIZATION;
    settings: SettingMetadata[];
}

function NestedListItem({
    catalogName,
    selectableTableStoreName,
    settings,
}: Props) {
    const intl = useIntl();

    const actionSettings = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['actionSettings']
    >(
        selectableTableStoreName,
        selectableTableStoreSelectors.actionSettings.get
    );

    const setActionSettings = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setActionSettings']
    >(
        selectableTableStoreName,
        selectableTableStoreSelectors.actionSettings.set
    );

    return (
        <>
            <ListItem>
                <ListItemText
                    primary={catalogName}
                    sx={{
                        'ml': 0.5,
                        '& .MuiListItemText-primary': {
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                        },
                    }}
                />
            </ListItem>

            <List component="div" disablePadding>
                {settings.map(({ messageId, setting }) => (
                    <ListItem key={setting} dense sx={{ py: 0, pl: 5 }}>
                        <FormControl>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={
                                            actionSettings[setting]?.includes(
                                                catalogName
                                            ) ?? false
                                        }
                                        onChange={(event) => {
                                            setActionSettings(
                                                setting,
                                                [catalogName],
                                                event.target.checked
                                            );
                                        }}
                                    />
                                }
                                label={intl.formatMessage({
                                    id: messageId,
                                })}
                            />
                        </FormControl>
                    </ListItem>
                ))}
            </List>
        </>
    );
}

export default NestedListItem;
