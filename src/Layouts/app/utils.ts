import toast from 'react-hot-toast';
import { QueryCache, QueryClient } from 'react-query';

const queryCache = new QueryCache({
  onError: (error, query) => {
    // only show errors for refetches. So intial error should be handled locally.
    if (query.state.data !== undefined) {
      if (error instanceof Error) toast.error(`Something went wrong ${error.message}`);
      else toast.error(`Something went wrong `);
    }
  },
});
export const rqClient = new QueryClient({ queryCache });
