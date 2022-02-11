import { RankedTester, rankWith, uiTypeIs } from '@jsonforms/core';
import {
    MaterialLayoutRenderer,
    MaterialLayoutRendererProps,
} from '@jsonforms/material-renderers';
import { withJsonFormsLayoutProps } from '@jsonforms/react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Hidden,
    Typography,
} from '@mui/material';

export const collapsibleGroupTester: RankedTester = rankWith(
    999,
    uiTypeIs('CollapsibleGroup')
);

const CollapsibleGroupRenderer = (props: any) => {
    const { uischema, schema, path, visible, renderers } = props;

    console.log('props', props);

    const labelElement = uischema.elements.shift();

    const layoutProps = {
        elements: uischema.elements,
        schema: schema,
        path: path,
        direction: 'column' as MaterialLayoutRendererProps['direction'],
        visible: visible,
        uischema: uischema,
        renderers: renderers,
    };
    return (
        <Hidden xsUp={!visible}>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{labelElement.text}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <MaterialLayoutRenderer {...layoutProps} />
                </AccordionDetails>
            </Accordion>
        </Hidden>
    );
};

export const CollapsibleGroup = withJsonFormsLayoutProps(
    CollapsibleGroupRenderer
);
