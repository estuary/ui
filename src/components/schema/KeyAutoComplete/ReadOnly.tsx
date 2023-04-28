import {
    Chip,
    Grid,
    IconButton,
    ListItem,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { HelpCircle } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';
import { hasLength } from 'utils/misc-utils';

interface Props {
    value: string[] | null;
}

function ReadOnly({ value }: Props) {
    const valueEmpty = !value || !hasLength(value);

    return (
        <Grid item xs={12}>
            <Stack
                direction="row"
                sx={{
                    alignItems: 'center',
                    alignContent: 'center',
                }}
            >
                <Typography variant="subtitle1" component="div">
                    <FormattedMessage id="schemaEditor.key.label" />
                </Typography>
                <Tooltip
                    title={<FormattedMessage id="schemaEditor.key.helper" />}
                >
                    <IconButton>
                        <HelpCircle />
                    </IconButton>
                </Tooltip>
            </Stack>

            {valueEmpty ? (
                <AlertBox
                    short
                    severity="warning"
                    title={
                        <FormattedMessage id="keyAutoComplete.keys.missing.title" />
                    }
                >
                    <FormattedMessage id="keyAutoComplete.keys.missing.message" />
                </AlertBox>
            ) : (
                <Stack
                    direction="row"
                    component="ol"
                    sx={{
                        alignItems: 'center',
                        alignContent: 'center',
                        flexFlow: 'wrap',
                        overflowY: 'wr',
                        pl: 0,
                    }}
                >
                    {value.map((key: string) => {
                        return (
                            <ListItem
                                key={`read-only-keys-${key}`}
                                dense
                                sx={{ px: 0.5, width: 'auto' }}
                            >
                                <Chip label={key} />
                            </ListItem>
                        );
                    })}
                </Stack>
            )}
        </Grid>
    );
}

export default ReadOnly;
