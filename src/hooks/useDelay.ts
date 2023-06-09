import { useEffect, useRef, useState } from 'react';

// This is not fully tested or used yet.
//  Please finish testing before launching

// Pass in when you want something to happen
//  and this will pass back a boolean that
//  will flip true after a delay

// Defaulting delay to just under 1 second in hope to keep people's attention
// https://www.nngroup.com/articles/response-times-3-important-limits/
function useDelay(when: boolean, delay = 800) {
    const timerRef = useRef<number>();
    const [response, setResponse] = useState(false);

    const cleanUp = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };

    useEffect(() => {
        // Start by resetting timer to handle...
        //  when = true  : make new one without leaks
        //  when = false : clean up old timers
        cleanUp();

        if (when) {
            timerRef.current = window.setTimeout(() => {
                setResponse(true);
            }, delay);
        } else {
            setResponse(false);
        }

        return () => {
            cleanUp();
        };
    }, [delay, when]);

    return response;
}

export default useDelay;
