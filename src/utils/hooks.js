import { useLocation } from '@docusaurus/router';

// A React Hook to get the current query params
function useQuery() {
    // make sure your function is being called in client side only
    if (typeof window == 'undefined') {
        return null;
    } else {
        return new URLSearchParams(useLocation().search);
    }

}

export { useQuery };