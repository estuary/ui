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
import { jsonFormsGroupHeaders } from 'context/Theme';
import { ADVANCED, CONTAINS_REQUIRED_FIELDS } from 'services/jsonforms';

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

    const uiSchemaOptions = uischema.options ?? {};
    const expand =
        uiSchemaOptions[CONTAINS_REQUIRED_FIELDS] === true ||
        uiSchemaOptions[ADVANCED] !== true ||
        false;

    return (
        <Hidden xsUp={!visible}>
            <Accordion defaultExpanded={expand}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                        backgroundColor: (theme) =>
                            jsonFormsGroupHeaders[theme.palette.mode],
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
