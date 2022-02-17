import {
    and,
    ControlProps,
    isStringControl,
    RankedTester,
    rankWith,
} from '@jsonforms/core';
import { Unwrapped } from '@jsonforms/material-renderers';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { Grid } from '@mui/material';
import { DescriptionWithLinks } from './DescriptionWithLinks';
const { MaterialTextControl } = Unwrapped;

// TODO - none of this is usable yet. Will need to try again once MUI 5 update is done? Maybe?
export const estuaryInputControl = (props: ControlProps) => {
    return (
        <Grid container>
            <Grid item xs={12}>
                <MaterialTextControl {...props} />
                <DescriptionWithLinks
                    isValid={false}
                    showDescription={false}
                    firstFormHelperText="first"
                    secondFormHelperText="second"
                />
            </Grid>
        </Grid>
    );
};

export const estuaryInputControlTester: RankedTester = rankWith(
    3,
    and(isStringControl)
);
export default withJsonFormsControlProps(estuaryInputControl);
