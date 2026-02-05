import type { RankedTester } from '@jsonforms/core';
import type { MaterialLayoutRendererProps } from '@jsonforms/material-renderers';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';

import { rankWith, uiTypeIs } from '@jsonforms/core';
import { MaterialLayoutRenderer } from '@jsonforms/material-renderers';

import { NavArrowDown, Xmark } from 'iconoir-react';
import { useIntl } from 'react-intl';

import { defaultOutline, jsonFormsGroupHeaders } from 'src/context/Theme';
import SshEndpointInfo from 'src/forms/renderers/Informational/SshEndpoint';
import { withCustomJsonFormsLayoutProps } from 'src/services/jsonforms/JsonFormsContext';
import {
    ADVANCED,
    CHILDREN_HAVE_VALUE,
    CONTAINS_REQUIRED_FIELDS,
    SHOW_INFO_SSH_ENDPOINT,
} from 'src/services/jsonforms/shared';

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
    visible,
    renderers,
    clearSettings,
}: any) => {
    const intl = useIntl();
    const theme = useTheme();

    const layoutProps = {
        elements: uischema.elements,
        schema,
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

    if (!visible) {
        return null;
    }

    return (
        <Accordion
            defaultExpanded={expand}
            sx={{
                borderBottom: expand
                    ? 'none'
                    : defaultOutline[theme.palette.mode],
            }}
        >
            <AccordionSummary
                expandIcon={
                    <NavArrowDown
                        style={{ color: theme.palette.text.primary }}
                    />
                }
                sx={{
                    backgroundColor:
                        jsonFormsGroupHeaders[theme.palette.mode],
                }}
            >
                <Typography sx={{ fontWeight: 500 }}>
                    {uischema.label}
                </Typography>
            </AccordionSummary>

            <AccordionDetails>
                {uiSchemaOptions[SHOW_INFO_SSH_ENDPOINT] === true ? (
                    <SshEndpointInfo />
                ) : null}

                {clearSettings ? (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'end',
                            my: 1,
                        }}
                    >
                        <Tooltip
                            title={intl.formatMessage({
                                id: 'jsonForms.clearGroup.message',
                            })}
                        >
                            <Button
                                disabled={
                                    !Boolean(
                                        uiSchemaOptions[CHILDREN_HAVE_VALUE]
                                    )
                                }
                                variant="text"
                                size="small"
                                onClick={clearSettings}
                                startIcon={
                                    <Xmark style={{ fontSize: 13 }} />
                                }
                                sx={{
                                    maxWidth: '75%',
                                }}
                            >
                                {intl.formatMessage(
                                    {
                                        id: 'jsonForms.clearGroup',
                                    },
                                    {
                                        label: uischema.label,
                                    }
                                )}
                            </Button>
                        </Tooltip>
                    </Box>
                ) : null}

                <MaterialLayoutRenderer {...layoutProps} />
            </AccordionDetails>
        </Accordion>
    );
};

export const CollapsibleGroup = withCustomJsonFormsLayoutProps(
    CollapsibleGroupRenderer
);
