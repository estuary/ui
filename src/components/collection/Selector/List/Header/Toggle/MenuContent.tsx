import { Box, Button, Divider, RadioGroup, Stack } from '@mui/material';
import RadioMenuItem from 'src/components/shared/RadioMenuItem';
import { useEntityType } from 'src/context/EntityContext';
import { SyntheticEvent, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Scopes } from './types';

interface MenuOption {
    title: string;
    desc: string;
}

interface Props {
    closeMenu: () => void;
    initialScope: Scopes;
    itemType: string;
    menuOptions: MenuOption[];
    updateScope: (event: SyntheticEvent, newScope: Scopes) => void;
}

// TODO (accessibility) this menu is not acessible and we have some options
//  - wait for https://github.com/mui/material-ui/issues/43330 to be fixed
//  - Write some tricky CSS in the parent that allows things to look the way they do but have all the items have a `MenuItem` around them
//  - fork MUI's Menu just for these and disable the up/down keyboard interactions
//  - Overhaul the entire approach to this menu and redesign it to somehow not need menu... let's not do this one
function ScopeMenuContent({
    closeMenu,
    initialScope,
    itemType,
    menuOptions,
    updateScope,
}: Props) {
    const intl = useIntl();
    const entityType = useEntityType();

    const [scope, setScope] = useState(initialScope);

    return (
        <>
            <RadioGroup
                onChange={(event) => setScope(event.target.value as Scopes)}
                value={scope}
                style={{ maxWidth: 320, textWrap: 'wrap' }}
            >
                <RadioMenuItem
                    description={intl.formatMessage(
                        { id: menuOptions[0].desc },
                        { itemType, entityType }
                    )}
                    label={intl.formatMessage({ id: menuOptions[0].title })}
                    value="all"
                />

                <RadioMenuItem
                    description={intl.formatMessage(
                        { id: menuOptions[1].desc },
                        { itemType, entityType }
                    )}
                    label={intl.formatMessage({ id: menuOptions[1].title })}
                    value="page"
                />
            </RadioGroup>

            <Divider style={{ marginTop: 4, marginBottom: 12 }} />

            <Stack
                direction="row"
                spacing={1}
                style={{ paddingBottom: 4, justifyContent: 'flex-end' }}
            >
                <Button
                    component={Box}
                    onClick={() => {
                        closeMenu();
                    }}
                    variant="text"
                >
                    <FormattedMessage id="cta.cancel" />
                </Button>

                <Button
                    component={Box}
                    onClick={(event: SyntheticEvent) => {
                        updateScope(event, scope);
                    }}
                    variant="outlined"
                >
                    <FormattedMessage id="cta.evolve" />
                </Button>
            </Stack>
        </>
    );
}

export default ScopeMenuContent;
