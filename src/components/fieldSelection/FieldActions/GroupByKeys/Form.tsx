import type { BaseProps } from 'src/components/fieldSelection/types';

import { useState } from 'react';

import { Autocomplete, TextField } from '@mui/material';

import { arrayMove } from '@dnd-kit/sortable';

import SortableTags from 'src/components/schema/KeyAutoComplete/SortableTags';

const GroupByKeysForm = ({ selections }: BaseProps) => {
    const [localCopyValue, setLocalCopyValue] = useState<string[]>(
        selections
            ?.filter(({ groupBy }) => groupBy.implicit)
            .map(({ field }) => field) ?? []
    );

    return (
        <Autocomplete
            multiple
            options={selections?.map(({ field }) => field) ?? []}
            renderInput={(params) => {
                return <TextField {...params} variant="standard" />;
            }}
            renderTags={(tagValues, getTagProps, ownerState) => {
                return (
                    <SortableTags
                        getTagProps={getTagProps}
                        onOrderChange={async (activeId, overId) => {
                            const oldIndex = localCopyValue.indexOf(activeId);
                            const newIndex = localCopyValue.indexOf(overId);

                            const updatedArray = arrayMove<string>(
                                localCopyValue,
                                oldIndex,
                                newIndex
                            );

                            setLocalCopyValue(updatedArray);
                            // await changeHandler?.(
                            //     null,
                            //     updatedArray,
                            //     'orderingUpdated'
                            // );
                        }}
                        ownerState={ownerState}
                        values={tagValues}
                    />
                );
            }}
        />
    );
};

export default GroupByKeysForm;
