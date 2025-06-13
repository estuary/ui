import type { BackfillDataflowOptionProps } from 'src/components/editor/Bindings/Backfill/types';

import { Autocomplete, Box, TextField, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import SelectorOption from 'src/components/incompatibleSchemaChange/SelectorOption';
import { useBinding_backfilledBindings_count } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';

function BackfillDataFlowOption({ disabled }: BackfillDataflowOptionProps) {
    const intl = useIntl();
    const backfillCount = useBinding_backfilledBindings_count();

    const [collectionResetEnabled, setCollectionResetEnabled] = useBindingStore(
        (state) => [
            state.collectionResetEnabled,
            state.setCollectionResetEnabled,
        ]
    );

    if (backfillCount < 1) {
        return null;
    }

    return (
        <Box sx={{ minWidth: 350, maxWidth: 350, mt: 3, ml: 1 }}>
            <Typography id="backfill-mode-label" fontWeight={700}>
                {intl.formatMessage({ id: 'workflows.dataFlowBackfill.label' })}
            </Typography>
            <Autocomplete
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option) => {
                    console.log('isOptionEqualToValue', option);

                    if (option.val === 'reset') {
                        return Boolean(collectionResetEnabled);
                    }

                    return !Boolean(collectionResetEnabled);
                }}
                options={[
                    {
                        description: intl.formatMessage({
                            id: 'workflows.dataFlowBackfill.options.reset.description',
                        }),
                        label: intl.formatMessage({
                            id: 'workflows.dataFlowBackfill.options.reset.label',
                        }),
                        val: 'reset',
                    },
                    {
                        description: intl.formatMessage({
                            id: 'workflows.dataFlowBackfill.options.incremental.description',
                        }),
                        label: intl.formatMessage({
                            id: 'workflows.dataFlowBackfill.options.incremental.label',
                        }),
                        val: 'incremental',
                    },
                ]}
                onChange={(_event, option: any) => {
                    setCollectionResetEnabled(Boolean(option.val === 'reset'));
                }}
                renderInput={(params) => {
                    return (
                        <TextField
                            {...params}
                            InputLabelProps={{
                                'aria-labelledby': 'backfill-mode-label',
                            }}
                            variant="standard"
                        />
                    );
                }}
                renderOption={(renderOptionProps, option: any) => {
                    return (
                        <li {...renderOptionProps}>
                            <SelectorOption option={option} />
                        </li>
                    );
                }}
            />

            {/*<FormControl sx={{ m: 1.2, [`& label`]: { my: 0.5 } }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                id="collectionSelector-dataFlowBackfill2"
                                value={!Boolean(collectionResetEnabled)}
                                onChange={(_event, checked) =>
                                    setCollectionResetEnabled(!checked)
                                }
                            />
                        }
                        label={
                            <Stack>
                                <Typography fontWeight={700}>
                                    Dataflow Reset:
                                </Typography>
                                <Typography>
                                    Backfill data from the source, reset
                                    inferred schemas, drop and re-create all
                                    destination tables and derivations.
                                </Typography>
                            </Stack>
                        }
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                id="collectionSelector-dataFlowBackfill2"
                                value={!Boolean(collectionResetEnabled)}
                                onChange={(_event, checked) =>
                                    setCollectionResetEnabled(!checked)
                                }
                            />
                        }
                        label={
                            <Stack>
                                <Typography fontWeight={700}>
                                    Incremental backfill:
                                </Typography>
                                <Typography>
                                    Re-extract all source data and Insert or
                                    Append into your existing destination tables
                                    without dropping and recreating them.
                                </Typography>
                            </Stack>
                        }
                    />
                </FormControl>*/}

            {/*<FormControl sx={{ mt: 1 }}>
                    <RadioGroup
                        aria-labelledby="demo-radio-buttons-group-label"
                        defaultValue="female"
                        name="radio-buttons-group"
                    >
                        <FormControlLabel
                            value="female"
                            control={<Radio />}
                            label={
                                <Stack>
                                    <Typography fontWeight={700}>
                                        Dataflow Reset:{' '}
                                    </Typography>
                                    <Typography>
                                        Backfill data from the source, reset
                                        inferred schemas, drop and re-create all
                                        destination tables and derivations.
                                    </Typography>
                                </Stack>
                            }
                        />
                        <FormControlLabel
                            value="male"
                            control={<Radio />}
                            label={
                                <Stack>
                                    <Typography fontWeight={700}>
                                        Incremental backfill:{' '}
                                    </Typography>
                                    <Typography>
                                        Re-extract all source data and Insert or
                                        Append into your existing destination
                                        tables without dropping and recreating
                                        them.
                                    </Typography>
                                </Stack>
                            }
                        />
                    </RadioGroup>
                </FormControl>*/}
        </Box>
    );
}

export default BackfillDataFlowOption;
