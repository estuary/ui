import type { OptionExampleProps } from 'src/components/materialization/source/targetSchema/types';

import { Stack, useTheme } from '@mui/material';

import { ArrowRight } from 'iconoir-react';

import MessageWithEmphasis from 'src/components/content/MessageWithEmphasis';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import { TARGET_SCHEMA_HIGHLIGHT_CLASS } from 'src/components/materialization/source/targetSchema/shared';

function OptionExample({ example, baseTableMessageID }: OptionExampleProps) {
    const theme = useTheme();

    return (
        <Stack
            component="span"
            direction="row"
            spacing={1}
            sx={{
                pl: 1.5,
                flexWrap: 'wrap',
                alignItems: 'center',
                fontSize: 12,
                [`& .${TARGET_SCHEMA_HIGHLIGHT_CLASS}`]: {
                    fontWeight: 700,
                    fontSize: 12.5,
                },
            }}
        >
            <code>
                <MessageWithEmphasis
                    messageID={baseTableMessageID}
                    emphasisContent={{
                        tablePrefix: <b>{example.tablePrefix}</b>,
                    }}
                />
            </code>
            <ArrowRight
                style={{
                    color: theme.palette.primary.main,
                    fontSize: 9,
                }}
            />

            <TechnicalEmphasis>
                <b>{example.schema}</b>.{example.table}
            </TechnicalEmphasis>
        </Stack>
    );
}

export default OptionExample;
