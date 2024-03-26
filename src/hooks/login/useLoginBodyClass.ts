import { useMount, useUnmount } from 'react-use';

// This is to allow this page to have a smaller min width
const bodyClass = 'loginPage';

function useLoginBodyClass() {
    useMount(() => {
        document.body.classList.add(bodyClass);
    });

    useUnmount(() => {
        document.body.classList.remove(bodyClass);
    });
}

export default useLoginBodyClass;
