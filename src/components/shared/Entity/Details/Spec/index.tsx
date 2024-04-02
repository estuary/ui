import { Grid, Stack, ToggleButtonGroup, Typography } from '@mui/material';
import LiveSpecEditor from 'components/editor/LiveSpec';
import ExternalLink from 'components/shared/ExternalLink';
import OutlinedToggleButton from 'components/shared/OutlinedToggleButton';
import { useEntityType } from 'context/EntityContext';
import { outlinedToggleButtonGroupStyling } from 'context/Theme';
import { Code, TableRows } from 'iconoir-react';
import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import CollectionSpecViews from './CollectionViews';

export type SpecPresentation = 'table' | 'code';

function Spec() {
    const entityType = useEntityType();

    const [presentation, setPresentation] = useState<SpecPresentation>('table');

    const evaluatePresentation = useCallback(
        (value: SpecPresentation, invertedValue: SpecPresentation): void => {
            const evaluatedValue =
                presentation === value ? invertedValue : value;

            setPresentation(evaluatedValue);
        },
        [presentation, setPresentation]
    );

    const docsLink = useMemo(() => {
        switch (entityType) {
            case 'capture':
                return 'https://docs.estuary.dev/concepts/captures/#specification';
            case 'materialization':
                return 'https://docs.estuary.dev/concepts/materialization/#specification';
            default:
                return 'https://docs.estuary.dev/concepts/collections/#specification';
        }
    }, [entityType]);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Stack spacing={2} sx={{ m: 2 }}>
                    <Stack
                        direction="row"
                        sx={{ justifyContent: 'space-between' }}
                    >
                        <Stack direction="row" spacing={1}>
                            <Typography
                                component="span"
                                variant="h6"
                                sx={{
                                    alignItems: 'center',
                                }}
                            >
                                <FormattedMessage id="detailsPanel.specification.header" />
                            </Typography>

                            <ExternalLink link={docsLink}>
                                <FormattedMessage id="terms.documentation" />
                            </ExternalLink>
                        </Stack>

                        {entityType === 'collection' ? (
                            <ToggleButtonGroup
                                size="small"
                                exclusive
                                sx={outlinedToggleButtonGroupStyling}
                            >
                                <OutlinedToggleButton
                                    size="small"
                                    value="table"
                                    selected={presentation === 'table'}
                                    onClick={(_event, value) =>
                                        evaluatePresentation(value, 'code')
                                    }
                                >
                                    <TableRows />
                                </OutlinedToggleButton>

                                <OutlinedToggleButton
                                    size="small"
                                    value="code"
                                    selected={presentation === 'code'}
                                    onClick={(_event, value) =>
                                        evaluatePresentation(value, 'table')
                                    }
                                >
                                    <Code />
                                </OutlinedToggleButton>
                            </ToggleButtonGroup>
                        ) : null}
                    </Stack>

                    {entityType === 'collection' ? (
                        <CollectionSpecViews presentation={presentation} />
                    ) : (
                        <LiveSpecEditor localZustandScope singleSpec />
                    )}
                </Stack>
            </Grid>
        </Grid>
    );
}

export default Spec;
