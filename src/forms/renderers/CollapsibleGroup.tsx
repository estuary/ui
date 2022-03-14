import {
    GroupLayout,
    LabelElement,
    LayoutProps,
    RankedTester,
    rankWith,
    uiTypeIs,
} from '@jsonforms/core';
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

export const CollapsibleGroupType = 'CollapsibleGroup';

export const collapsibleGroupTester: RankedTester = rankWith(
    999,
    uiTypeIs(CollapsibleGroupType)
);

const CollapsibleGroupRenderer = ({
    uischema,
    schema,
    path,
    visible,
    renderers,
}: LayoutProps) => {
    const groupLayout = uischema as GroupLayout;
    const labelElement = groupLayout.elements.shift() as LabelElement;

    const layoutProps = {
        direction: 'column' as MaterialLayoutRendererProps['direction'],
        elements: groupLayout.elements,
        path,
        renderers,
        schema,
        uischema,
        visible,
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
