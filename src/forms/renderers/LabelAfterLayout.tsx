import { rankWith, uiTypeIs } from '@jsonforms/core';
import {
    MaterialLayoutRenderer,
    MaterialLayoutRendererProps,
} from '@jsonforms/material-renderers';
import { withJsonFormsLayoutProps } from '@jsonforms/react';
import { Grid, Typography } from '@mui/material';

const LabelAfterRenderer = (props: any) => {
    const { uischema, schema, path, visible, renderers } = props;

    const layoutProps = {
        elements: [uischema.elements[0]],
        schema,
        path,
        direction: 'row',
        visible,
        uischema,
        renderers,
    } as MaterialLayoutRendererProps;
    return (
        <Grid container>
            <Grid item xs={11}>
                <MaterialLayoutRenderer {...layoutProps} />
            </Grid>
            <Grid
                item
                xs={1}
                sx={{
                    alignSelf: 'center',
                    textAlign: 'end', //This looks more centered in view due to extra padding around stuff
                }}
            >
                <Typography variant="h5" color="initial">
                    {uischema.elements[1].label}
                </Typography>
            </Grid>
        </Grid>
    );
};

export const LabelAfterLayout = withJsonFormsLayoutProps(LabelAfterRenderer);

export const labelAfterLayoutTester = rankWith(1000, uiTypeIs('LabelAfter'));
