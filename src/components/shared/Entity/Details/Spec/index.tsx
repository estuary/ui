import { useCallback, useMemo, useState } from 'react';

import { Grid, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import LiveSpecEditor from 'src/components/editor/LiveSpec';
import OutlinedToggleButton from 'src/components/shared/buttons/OutlinedToggleButton';
import CardWrapper from 'src/components/shared/CardWrapper';
import { HEIGHT } from 'src/components/shared/Entity/Details/History/shared';
import CollectionSpecViews from 'src/components/shared/Entity/Details/Spec/CollectionViews';
import ExternalLink from 'src/components/shared/ExternalLink';
import OutlinedToggleButtonGroup from 'src/components/shared/OutlinedToggleButtonGroup';
import { useEntityType } from 'src/context/EntityContext';
import { cardHeaderSx } from 'src/context/Theme';

export type SpecPresentation = 'table' | 'code';

function Spec() {
    const intl = useIntl();
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
        <CardWrapper
            disableMinWidth
            message={
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1}>
                        <Typography
                            component="span"
                            variant="h6"
                            sx={{
                                ...cardHeaderSx,
                                alignItems: 'center',
                            }}
                        >
                            {intl.formatMessage({
                                id: 'detailsPanel.specification.header',
                            })}
                        </Typography>

                        <ExternalLink link={docsLink}>
                            {intl.formatMessage({ id: 'terms.documentation' })}
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
                                {intl.formatMessage({
                                    id: 'details.spec.cta.formatted',
                                })}
                            </OutlinedToggleButton>

                            <OutlinedToggleButton
                                size="small"
                                value="code"
                                selected={presentation === 'code'}
                                onClick={(_event, value) =>
                                    evaluatePresentation(value, 'table')
                                }
                            >
                                {intl.formatMessage({
                                    id: 'details.spec.cta.raw',
                                })}
                            </OutlinedToggleButton>
                        </OutlinedToggleButtonGroup>
                    ) : null}
                </Stack>
            }
        >
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Stack spacing={2}>
                        {entityType === 'collection' ? (
                            <CollectionSpecViews presentation={presentation} />
                        ) : (
                            <LiveSpecEditor
                                localZustandScope
                                singleSpec
                                height={HEIGHT}
                            />
                        )}
                    </Stack>
                </Grid>
            </Grid>
        </CardWrapper>
    );
}

export default Spec;
