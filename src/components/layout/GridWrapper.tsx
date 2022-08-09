import { Grid } from '@mui/material';
import { ReactNode } from 'react';
import { hasLength } from 'utils/misc-utils';

interface Props {
    cardWidth: number;
    cardsPerRow: number;
    gridSpacing: number;
    content: any[];
    children: ReactNode;
}

function GridWrapper({
    cardWidth,
    cardsPerRow,
    gridSpacing,
    content,
    children,
}: Props) {
    return (
        <Grid
            container
            spacing={2}
            paddingRight={2}
            width={
                cardWidth * cardsPerRow + 8 * gridSpacing * (cardsPerRow + 1)
            }
            margin="auto"
        >
            {hasLength(content)
                ? content.map((row, index) => (
                      <Grid key={index} item>
                          {children}
                      </Grid>
                  ))
                : null}
        </Grid>
    );
}

export default GridWrapper;
