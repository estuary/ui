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
import { slate } from 'context/Theme';

export const CollapsibleGroupType = 'CollapsibleGroup';

export const collapsibleGroupTester: RankedTester = rankWith(
    999,
    uiTypeIs('Group')
);

// TODO (typing) Just used any here as it makes things easier.
//  previous versions had more typing but the typing wasn't 100% correct
const CollapsibleGroupRenderer = ({
    uischema,
    schema,
    path,
    visible,
    renderers,
}: any) => {
    const layoutProps = {
        elements: uischema.elements,
        schema,
        path,
        direction: 'column' as MaterialLayoutRendererProps['direction'],
        visible,
        uischema,
        renderers,
    };

    // Does this Group represent an advanced configuration section, which should be collapsed by
    // default?
    const expand = uischema.options?.advanced !== true;

    return (
        <Hidden xsUp={!visible}>
            <Accordion
                defaultExpanded={expand}
                disableGutters
                variant="elevation"
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                        backgroundColor: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'transparent'
                                : slate[50],
                    }}
                >
                    <Typography>{uischema.label}</Typography>
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
