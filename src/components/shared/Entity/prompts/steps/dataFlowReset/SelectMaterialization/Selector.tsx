import { Autocomplete, Grid, Skeleton, TextField } from '@mui/material';
import { autoCompleteDefaults_Virtual } from 'components/shared/AutoComplete/DefaultProps';
import { ReactNode, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import { LiveSpecsExt_Related } from 'api/liveSpecsExt';
import AlertBox from 'components/shared/AlertBox';
import { usePreSavePromptStore } from '../../../store/usePreSavePromptStore';
import { RelatedMaterializationSelectorProps } from './types';
import SelectorOption from './SelectorOption';

const getValue = (option: any) =>
    typeof option === 'string' ? option : option?.catalog_name;

function Selector({
    disabled,
    keys,
    loading,
}: RelatedMaterializationSelectorProps) {
    const intl = useIntl();
    const stepIndex = useLoopIndex();

    const [inputValue, setInputValue] = useState('');

    const [updateStep, updateContext] = usePreSavePromptStore((state) => [
        state.updateStep,
        state.updateContext,
    ]);

    const backfillTarget = usePreSavePromptStore((state) => {
        return state.context.backfillTarget;
    });

    useEffect(() => {
        updateContext({
            noMaterializations: Boolean(!loading && keys.length === 0),
        });
    }, [keys.length, loading, updateContext]);

    if (loading) {
        return <Skeleton />;
    }

    if (keys.length === 0) {
        return (
            <AlertBox
                severity="info"
                short
                title={intl.formatMessage({
                    id: 'resetDataFlow.materializations.empty.header',
                })}
            >
                {intl.formatMessage({
                    id: 'resetDataFlow.materializations.empty.message',
                })}
            </AlertBox>
        );
    }

    return (
        <Grid item xs={12}>
            <Autocomplete
                {...autoCompleteDefaults_Virtual}
                disabled={disabled}
                getOptionLabel={getValue}
                inputValue={inputValue}
                options={keys}
                value={backfillTarget ?? null}
                isOptionEqualToValue={(option, optionValue) => {
                    return option.catalog_name === optionValue.catalog_name;
                }}
                onChange={(_event, newValue: LiveSpecsExt_Related | null) => {
                    const newBackfillTarget = newValue ? newValue : null;

                    updateContext({
                        backfillTarget: newBackfillTarget,
                    });

                    updateStep(stepIndex, {
                        valid: Boolean(newBackfillTarget),
                    });
                }}
                onInputChange={(_event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                renderInput={(params) => {
                    return (
                        <TextField
                            {...params}
                            disabled={disabled}
                            helperText={intl.formatMessage({
                                id: 'resetDataFlow.materializations.selector.helper',
                            })}
                            label={intl.formatMessage({
                                id: 'resetDataFlow.materializations.selector.label',
                            })}
                            variant="standard"
                        />
                    );
                }}
                renderOption={(renderOptionProps, option, state) => {
                    const RowContent = (
                        <SelectorOption
                            option={option}
                            x-react-window-item-height={100}
                        />
                    );

                    return [
                        renderOptionProps,
                        RowContent,
                        state.selected,
                    ] as ReactNode;
                }}
            />
        </Grid>
    );
}

export default Selector;
