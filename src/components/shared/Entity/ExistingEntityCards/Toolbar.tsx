import {
    Autocomplete,
    AutocompleteRenderInputParams,
    debounce,
    FilledInputProps,
    Grid,
    SxProps,
    TextField,
    Theme,
    Toolbar,
} from '@mui/material';
import {
    semiTransparentBackground,
    semiTransparentBackgroundIntensified,
} from 'context/Theme';
import {
    ChangeEvent,
    Dispatch,
    SetStateAction,
    SyntheticEvent,
    useRef,
} from 'react';
import { useIntl } from 'react-intl';
import { SortDirection } from 'types';
import useConstant from 'use-constant';

interface Props {
    belowMd: boolean;
    gridSpacing: number;
    setSearchQuery: Dispatch<SetStateAction<string | null>>;
    setSortDirection: Dispatch<SetStateAction<SortDirection>>;
}

const inputProps: Partial<FilledInputProps> = {
    disableUnderline: true,
    sx: {
        borderRadius: 5,
        backgroundColor: (theme) =>
            semiTransparentBackground[theme.palette.mode],
    },
};

const toolbarSectionSx: SxProps<Theme> = {
    '& .MuiInputLabel-root.Mui-focused': {
        color: (theme) =>
            theme.palette.mode === 'dark'
                ? 'primary'
                : theme.palette.text.secondary,
    },
    '& .MuiFilledInput-root:hover, .MuiFilledInput-root.Mui-focused': {
        backgroundColor: (theme) =>
            semiTransparentBackgroundIntensified[theme.palette.mode],
    },
};

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
                <Grid item xs={12} md={4}>
                    <TextField
                        autoFocus
                        label={intl.formatMessage({
                            id: 'existingEntityCheck.toolbar.label.filter',
                        })}
                        variant="filled"
                        InputProps={inputProps}
                        onChange={handlers.filterCards}
                        sx={{
                            width: '100%',
                            borderRadius: 5,
                            ...toolbarSectionSx,
                        }}
                    />
                </Grid>

                <Grid item xs={4} md={2}>
                    <Autocomplete
                        options={sortDirectionOptions.map(
                            ({ message }) => message
                        )}
                        renderInput={({
                            InputProps,
                            ...params
                        }: AutocompleteRenderInputParams) => (
                            <TextField
                                {...params}
                                InputProps={{
                                    ...InputProps,
                                    ...inputProps,
                                }}
                                label={intl.formatMessage({
                                    id: 'existingEntityCheck.toolbar.label.sortDirection',
                                })}
                                variant="filled"
                            />
                        )}
                        defaultValue={intl.formatMessage({
                            id: 'sortDirection.ascending',
                        })}
                        disableClearable
                        onChange={handlers.switchSortDirection}
                        sx={toolbarSectionSx}
                    />
                </Grid>
            </Grid>
        </Toolbar>
    );
}

export default ExistingEntityCardToolbar;
