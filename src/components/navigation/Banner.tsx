import {
    Collapse,
    IconButton,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { NavArrowDown } from 'iconoir-react';
import { useEffect, useRef, useState } from 'react';
import { useTopBarStore } from 'stores/TopBar/Store';
import {
    BANNER_HEIGHT,
    getSemanticBackgroundColor,
    getSemanticBorder,
    isOverflown,
} from './shared';

export default function Banner() {
    const theme = useTheme();

    const contentEl = useRef<HTMLElement | null>(null);

    const bannerOpen = useTopBarStore((state) => state.bannerOpen);
    const setBannerOpen = useTopBarStore((state) => state.setBannerOpen);

    const [severity, setSeverity] = useState<string>('');
    const [expanded, setExpanded] = useState(false);
    const [overflown, setOverflown] = useState(false);

    useEffect(() => {
        setSeverity('error');
        setBannerOpen(true);
        setOverflown(isOverflown(contentEl.current));
    }, [setBannerOpen, setOverflown, setSeverity]);

    return (
        <Collapse in={bannerOpen}>
            <Stack
                direction="row"
                style={{
                    alignItems: 'flex-start',
                    backgroundColor: getSemanticBackgroundColor(
                        theme.palette.mode,
                        severity
                    ),
                    border: getSemanticBorder(theme.palette.mode, severity),
                    height: expanded ? 'fit-content' : BANNER_HEIGHT,
                    justifyContent: 'space-between',
                    paddingBottom: 4,
                    paddingLeft: 72,
                    paddingRight: 24,
                    paddingTop: 4,
                }}
            >
                <Typography
                    noWrap={!expanded}
                    ref={contentEl}
                    style={{ textOverflow: 'ellipsis' }}
                    variant="caption"
                >
                    Here is a short message that could potentially be close to
                    the length of a real message. Here is a short message that
                    could potentially be close to the length of a real message.
                    Here is a short message that could potentially be close to
                    the length of a real message. Here is a short message that
                    could potentially be close to the length of a real message.
                    Here is a short message that could potentially be close to
                    the length of a real message. Here is a short message that
                    could potentially be close to the length of a real message.
                    Here is a short message that could potentially be close to
                    the length of a real message. Here is a short message that
                    could potentially be close to the length of a real message.
                </Typography>

                {overflown ? (
                    <IconButton
                        size="small"
                        onClick={() => {
                            setExpanded(!expanded);
                        }}
                        style={{ padding: 0 }}
                    >
                        <NavArrowDown
                            style={{
                                color: theme.palette.text.primary,
                                transform: expanded
                                    ? 'scaleY(-1)'
                                    : 'scaleY(1)',
                                transition: 'all 50ms ease-in-out',
                            }}
                        />
                    </IconButton>
                ) : null}
            </Stack>
        </Collapse>
    );
}
