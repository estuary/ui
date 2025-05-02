import type { BaseComponentProps } from 'src/types';

import { useState } from 'react';

import { Stack } from '@mui/material';

import { useMount } from 'react-use';

export const TitleContainer = ({ children }: BaseComponentProps) => {
    const [titleContainerWidth, setTitleContainerWidth] = useState(180);

    const onWindowResize = () => {
        const width =
            document.getElementsByClassName('connector-info')[0]?.clientWidth;

        if (width) {
            setTitleContainerWidth(width - 16);
        }
    };

    useMount(() => {
        window.addEventListener('resize', onWindowResize);

        return () => {
            window.removeEventListener('resize', onWindowResize);
        };
    });

    return (
        <Stack
            sx={{
                'alignItems': 'flex-start',
                '.connector-title': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: titleContainerWidth,
                },
            }}
        >
            {children}
        </Stack>
    );
};
