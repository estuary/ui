// We  heavily base this off JsonForms stuff so tweaking linting options they don't use
/* eslint-disable @typescript-eslint/unbound-method */

/*
  The MIT License

  Copyright (c) 2017-2020 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import { EnumCellProps, EnumOption, WithClassname } from '@jsonforms/core';
import {
    Autocomplete,
    AutocompleteRenderOptionState,
    FilterOptionsState,
} from '@mui/material';
import ConnectorInput from 'forms/renderers/ConnectorSelect/Input';
import ConnectorOption from 'forms/renderers/ConnectorSelect/Option';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import merge from 'lodash/merge';
import React, { ReactNode, useMemo } from 'react';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { hasLength } from 'utils/misc-utils';

export interface WithOptionLabel {
    getOptionLabel?(option: EnumOption): string;
    renderOption?(
        props: React.HTMLAttributes<HTMLLIElement>,
        option: EnumOption,
        state: AutocompleteRenderOptionState
    ): ReactNode;
    filterOptions?(
        options: EnumOption[],
        state: FilterOptionsState<EnumOption>
    ): EnumOption[];
}

const areConnectorIdsEqual = (option?: any, value?: any) => {
    return (
        value?.connectorId &&
        value.connectorId.length > 0 &&
        option.connectorId === value.connectorId
    );
};

const areTagsEqual = (option?: any, value?: any) => {
    return value?.id && value.id.length > 0 && option.id === value.id;
};

export const ConnectorAutoComplete = (
    props: EnumCellProps & WithClassname & WithOptionLabel
) => {
    const tagEditEnabled = useGlobalSearchParams(
        GlobalSearchParams.TAG_EDIT_ENABLED
    );

    const {
        data,
        className,
        id,
        enabled,
        uischema,
        path,
        options,
        config,
        handleChange,
        getOptionLabel,
        filterOptions,
    } = props;

    // const hasMultipleTags = options.tags.length > 1;
    const appliedUiSchemaOptions = merge({}, config, uischema.options);
    const [inputValue, setInputValue] = React.useState('');
    const currentOption = useMemo(
        () =>
            options?.find((option) => {
                return areTagsEqual(option.value, data);
            }) ?? null,
        [data, options]
    );

    // Go through all the options and see where we have "duplicate" connectors
    //  this allows us to make these sub selections
    const [uniqueOptions, duplicateOptions] = useMemo(() => {
        const uniqueResponses: any[] = [];
        const duplicatesResponses: any = {};

        if (!options || !hasLength(options)) {
            return [uniqueResponses, duplicatesResponses];
        }

        options.forEach((option) => {
            const existingResponse = uniqueResponses.find(
                (uniqueResponse: any) =>
                    areConnectorIdsEqual(uniqueResponse.value, option.value)
            );

            if (existingResponse) {
                duplicatesResponses[option.value.connectorId] = {
                    ...(duplicatesResponses[option.value.connectorId] ?? {
                        [existingResponse.value.id]: existingResponse.value,
                    }),
                    [option.value.id]: option.value,
                };
            } else {
                // If we have a current option then use that in the list
                //  so that it can be shown as selected.
                uniqueResponses.push(
                    currentOption?.value.connectorId ===
                        option.value.connectorId
                        ? currentOption
                        : option
                );
            }
        });

        return [uniqueResponses, duplicatesResponses];
    }, [currentOption, options]);

    const currentOptionsTags = useMemo(() => {
        if (tagEditEnabled !== 'true') {
            return null;
        }

        if (!currentOption) {
            return null;
        }

        if (duplicateOptions[currentOption.value.connectorId]) {
            return Object.values(
                duplicateOptions[currentOption.value.connectorId]
            );
        }

        return [];
    }, [currentOption, duplicateOptions, tagEditEnabled]);

    return (
        <Autocomplete
            options={uniqueOptions}
            getOptionLabel={getOptionLabel ?? ((option) => option.label)}
            className={className}
            id={id}
            disabled={!enabled}
            value={currentOption}
            inputValue={inputValue}
            onChange={(_event: any, newValue: EnumOption | null) => {
                handleChange(path, newValue?.value ?? { id: '' });
            }}
            onInputChange={(_event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            autoHighlight
            autoComplete
            clearOnBlur
            fullWidth
            sx={{
                marginTop: 2,
            }}
            filterOptions={filterOptions}
            renderInput={({ inputProps, InputProps }) => {
                return (
                    <ConnectorInput
                        inputProps={inputProps}
                        InputProps={InputProps}
                        appliedUiSchemaOptions={appliedUiSchemaOptions}
                        enabled={enabled}
                        currentOption={currentOption}
                        currentOptionsTags={currentOptionsTags}
                        updateTag={(updatedOption) => {
                            logRocketEvent(
                                CustomEvents.ENTITY_CREATE_TAG_CHANGED
                            );
                            handleChange(path, updatedOption);
                        }}
                    />
                );
            }}
            renderOption={(renderOptionProps, option) => {
                return (
                    <ConnectorOption
                        renderOptionProps={renderOptionProps}
                        option={option}
                        key={option.label}
                    />
                );
            }}
        />
    );
};
