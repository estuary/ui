import { Box, ToggleButton, ToggleButtonGroup, styled } from '@mui/material';
import {
    ConstraintTypes,
    FieldSelectionType,
    TranslatedConstraint,
} from 'components/editor/Bindings/FieldSelection/types';
import OutlinedToggleButton from 'components/tables/cells/fieldSelection/OutlinedToggleButton';
import { intensifiedOutline } from 'context/Theme';
import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    constraint: TranslatedConstraint;
    selectedValue: FieldSelectionType;
    setSelectedValue: Dispatch<SetStateAction<FieldSelectionType>>;
}

// TODO (field selection): Share disabled and shared state styling with the OutlinedToggleButton component.
const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    'width': '100%',
    'justifyContent': 'space-between',
    '& .MuiToggleButtonGroup-grouped': {
        'border': intensifiedOutline[theme.palette.mode],
        'borderRadius': 4,
        '&.Mui-disabled': {
            border: `1px solid ${theme.palette.divider}`,
        },
        '&.Mui-selected': {
            backgroundColor: 'rgba(58, 86, 202, 0.15)',
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
        },
    },
}));

// TODO (field selection): Determine whether the included/excluded toggle button group should be disabled
//   when the default option is selected.
function CustomSelectionOptions({
    constraint,
    selectedValue,
    setSelectedValue,
}: Props) {
    if (constraint.type === ConstraintTypes.UNSATISFIABLE) {
        return null;
    } else if (
        constraint.type === ConstraintTypes.FIELD_REQUIRED ||
        constraint.type === ConstraintTypes.LOCATION_REQUIRED
    ) {
        return (
            <Box>
                <OutlinedToggleButton
                    messageId="fieldSelection.table.cta.includeField"
                    selectedValue={selectedValue}
                    value="include"
                    onClick={() => {
                        setSelectedValue(
                            selectedValue === 'include' ? 'default' : 'include'
                        );
                    }}
                />
            </Box>
        );
    } else {
        return (
            <Box>
                <StyledToggleButtonGroup
                    size="small"
                    value={selectedValue}
                    exclusive
                    onChange={(
                        _event: React.MouseEvent<HTMLElement>,
                        value: FieldSelectionType
                    ) => {
                        setSelectedValue(value);
                    }}
                    aria-label="text alignment"
                    // disabled={toggleDisabled}
                >
                    <ToggleButton
                        value="include"
                        aria-label="left aligned"
                        sx={{ px: '9px', py: '3px' }}
                    >
                        <FormattedMessage id="fieldSelection.table.cta.includeField" />
                    </ToggleButton>

                    <ToggleButton
                        value="exclude"
                        aria-label="right aligned"
                        sx={{ px: '9px', py: '3px' }}
                    >
                        <FormattedMessage id="fieldSelection.table.cta.excludeField" />
                    </ToggleButton>
                </StyledToggleButtonGroup>
            </Box>
        );
    }
}

export default CustomSelectionOptions;
