import {
    Checkbox,
    Collapse,
    FormControl,
    FormControlLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    useTheme,
} from '@mui/material';
import { useZustandStore } from 'context/Zustand/provider';
import { Settings } from 'iconoir-react';
import { useState } from 'react';
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
        | SelectTableStoreNames.COLLECTION_SELECTOR
        | SelectTableStoreNames.MATERIALIZATION;
    settings: SettingMetadata[];
}

function NestedListItem({
    catalogName,
    selectableTableStoreName,
    settings,
}: Props) {
    const intl = useIntl();
    const theme = useTheme();

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

    const [open, setOpen] = useState<boolean>(false);

    const toggleList = () => {
        setOpen(!open);
    };

    return (
        <>
            <ListItemButton
                selected={open}
                onClick={toggleList}
                sx={{
                    'width': '100%',
                    'px': 1,
                    '&.MuiButtonBase-root:hover::after': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                    '&.Mui-selected': {
                        backgroundColor: open
                            ? 'unset'
                            : 'rgba(58, 86, 202, 0.08)',
                        color: open
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                        boxShadow: open
                            ? undefined
                            : `inset 0px 0px 0px 1px ${theme.palette.primary.main}`,
                    },
                }}
            >
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

                <Settings
                    style={{
                        color: open
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                    }}
                />
            </ListItemButton>

            <Collapse
                in={open}
                timeout="auto"
                unmountOnExit
                sx={{ width: '100%' }}
            >
                <List component="div" disablePadding>
                    {settings.map(({ messageId, setting }) => (
                        <ListItem key={setting} dense sx={{ py: 0, pl: 5 }}>
                            <FormControl>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={
                                                actionSettings[
                                                    setting
                                                ]?.includes(catalogName) ??
                                                false
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
            </Collapse>
        </>
    );
}

export default NestedListItem;
