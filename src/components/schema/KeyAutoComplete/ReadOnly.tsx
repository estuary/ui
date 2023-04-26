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

interface Props {
    value: string[] | null;
}

function ReadOnly({ value }: Props) {
    return (
        <Grid item xs={12}>
            <Stack
                direction="row"
                sx={{
                    alignItems: 'center',
                    alignContent: 'center',
                }}
            >
                <Stack
                    direction="row"
                    sx={{
                        alignItems: 'center',
                        alignContent: 'center',
                    }}
                >
                    <Typography variant="subtitle1" component="div">
                        <FormattedMessage id="data.key.label" />
                    </Typography>
                    <Tooltip title={<FormattedMessage id="data.key.helper" />}>
                        <IconButton>
                            <HelpCircle />
                        </IconButton>
                    </Tooltip>
                </Stack>
                <Stack
                    direction="row"
                    component="ol"
                    sx={{
                        overflowY: 'auto',
                        pl: 0,
                    }}
                >
                    {!value ? (
                        <AlertBox severity="warning" short>
                            <FormattedMessage id="keyAutoComplete.keys.missing" />
                        </AlertBox>
                    ) : (
                        value.map((key: string) => {
                            let icon;
                            return (
                                <ListItem
                                    key={`read-only-keys-${key}`}
                                    dense
                                    sx={{ px: 0.5 }}
                                >
                                    <Chip icon={icon} label={key} />
                                </ListItem>
                            );
                        })
                    )}
                </Stack>
            </Stack>
        </Grid>
    );
}

export default ReadOnly;
