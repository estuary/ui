import { Grid, Stack, Typography } from '@mui/material';
import LiveSpecEditor from 'components/editor/LiveSpec';
import OutlinedToggleButton from 'components/shared/buttons/OutlinedToggleButton';
import ExternalLink from 'components/shared/ExternalLink';
import OutlinedToggleButtonGroup from 'components/shared/OutlinedToggleButtonGroup';
import { useEntityType } from 'context/EntityContext';
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
                            <OutlinedToggleButtonGroup size="small" exclusive>
                                <OutlinedToggleButton
                                    size="small"
                                    value="table"
                                    selected={presentation === 'table'}
                                    onClick={(_event, value) =>
                                        evaluatePresentation(value, 'code')
                                    }
                                >
                                    <FormattedMessage id="details.spec.cta.formatted" />
                                </OutlinedToggleButton>

                                <OutlinedToggleButton
                                    size="small"
                                    value="code"
                                    selected={presentation === 'code'}
                                    onClick={(_event, value) =>
                                        evaluatePresentation(value, 'table')
                                    }
                                >
                                    <FormattedMessage id="details.spec.cta.raw" />
                                </OutlinedToggleButton>
                            </OutlinedToggleButtonGroup>
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
