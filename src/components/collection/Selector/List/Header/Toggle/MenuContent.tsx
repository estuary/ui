import { Box, Button, Divider, RadioGroup, Stack } from '@mui/material';
import RadioMenuItem from 'components/shared/RadioMenuItem';
import { useEntityType } from 'context/EntityContext';
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
