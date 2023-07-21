import { SortDirection } from 'types';

import {
    ChangeEvent,
    Dispatch,
    SetStateAction,
    SyntheticEvent,
    useRef,
} from 'react';

import { useIntl } from 'react-intl';
import useConstant from 'use-constant';

import { debounce, Grid, Toolbar } from '@mui/material';

import AutocompletedField from 'components/shared/toolbar/AutocompletedField';
import SearchField from 'components/shared/toolbar/SearchField';

interface Props {
    belowMd: boolean;
    gridSpacing: number;
    setSearchQuery: Dispatch<SetStateAction<string | null>>;
    setSortDirection: Dispatch<SetStateAction<SortDirection>>;
}

function ExistingEntityCardToolbar({
    belowMd,
    gridSpacing,
    setSearchQuery,
    setSortDirection,
}: Props) {
    const intl = useIntl();
    const isFiltering = useRef(false);

    const sortDirectionOptions: {
        direction: SortDirection;
        message: string;
    }[] = useConstant(() => [
        {
            direction: 'asc',
            message: intl.formatMessage({
                id: 'sortDirection.ascending',
            }),
        },
        {
            direction: 'desc',
            message: intl.formatMessage({
                id: 'sortDirection.descending',
            }),
        },
    ]);

    const handlers = {
        switchSortDirection: (_event: SyntheticEvent, value: string | null) => {
            const selectedDirection = sortDirectionOptions.find(
                (option) => option.message === value
            )?.direction;

            setSortDirection(selectedDirection ? selectedDirection : 'asc');
        },
        filterCards: debounce(
            (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const filterQuery = event.target.value;
                const hasQuery = Boolean(filterQuery && filterQuery.length > 0);

                isFiltering.current = hasQuery;

                setSearchQuery(hasQuery ? filterQuery : null);
            },
            750
        ),
    };

    return (
        <Toolbar
            disableGutters
            sx={{ flexDirection: belowMd ? 'column' : 'row' }}
            data-public
        >
            <Grid
                container
                spacing={gridSpacing}
                wrap="wrap"
                sx={{
                    justifyContent: 'flex-end',
                }}
            >
                <Grid item xs={8} md={4}>
                    <SearchField
                        label={intl.formatMessage({
                            id: 'existingEntityCheck.toolbar.label.filter',
                        })}
                        changeHandler={handlers.filterCards}
                        autoFocus={true}
                    />
                </Grid>

                <Grid item xs={4} md={2}>
                    <AutocompletedField
                        label={intl.formatMessage({
                            id: 'existingEntityCheck.toolbar.label.sortDirection',
                        })}
                        options={sortDirectionOptions.map(
                            ({ message }) => message
                        )}
                        defaultValue={intl.formatMessage({
                            id: 'sortDirection.ascending',
                        })}
                        changeHandler={handlers.switchSortDirection}
                    />
                </Grid>
            </Grid>
        </Toolbar>
    );
}

export default ExistingEntityCardToolbar;
