import { Button, Divider, RadioGroup, Stack } from '@mui/material';
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
    initialScope: Scopes;
    itemType: string;
    menuOptions: MenuOption[];
    updateScope: (newScope: Scopes) => void;
}

function ScopeMenuContent({
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

            <Stack style={{ paddingBottom: 4 }}>
                <Button
                    variant="outlined"
                    onClick={() => {
                        updateScope(scope);
                    }}
                >
                    <FormattedMessage id="cta.evolve" />
                </Button>
            </Stack>
        </>
    );
}

export default ScopeMenuContent;
