import { Box, Button, Divider, RadioGroup, Stack } from '@mui/material';
import { useEntityType } from 'context/EntityContext';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ScopeMenuItem from './MenuItem';
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
    updateScope: (newScope: Scopes) => void;
}

function ScopeMenuContent({
    closeMenu,
    initialScope,
    itemType,
    menuOptions,
    updateScope,
}: Props) {
    const entityType = useEntityType();

    const [scope, setScope] = useState(initialScope);

    return (
        <>
            <RadioGroup
                onChange={(event) => setScope(event.target.value as Scopes)}
                value={scope}
                style={{ maxWidth: 320, textWrap: 'wrap' }}
            >
                <ScopeMenuItem
                    desc={
                        <FormattedMessage
                            id={menuOptions[0].desc}
                            values={{ itemType, entityType }}
                        />
                    }
                    scope="all"
                    title={<FormattedMessage id={menuOptions[0].title} />}
                />

                <ScopeMenuItem
                    desc={
                        <FormattedMessage
                            id={menuOptions[1].desc}
                            values={{ itemType, entityType }}
                        />
                    }
                    scope="page"
                    title={<FormattedMessage id={menuOptions[1].title} />}
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
                    onClick={() => {
                        updateScope(scope);
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
