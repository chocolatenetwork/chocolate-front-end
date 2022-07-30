/* eslint-disable import/no-unresolved */
import Login from 'chocolate/polkadot-apac-hackathon/Auth-View/login-interaction';
import SignUp from 'chocolate/polkadot-apac-hackathon/Auth-View/sign-up-interaction';
import AuthProvider from 'chocolate/polkadot-apac-hackathon/common/providers/authProvider';
/* eslint-enable import/no-unresolved */
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { QueryCache, QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserProfile from '../../polkadot-apac-hackathon/userProfile';
import { useSubstrate } from '../../substrate-lib';
import Gallery from '../Gallery';
import MenuBar from '../menuBar';
import ProjectProfile from '../ProjectProfile';
import ProjectsRe from '../ProjectsRe';
import { loader, message } from '../utilities';
import WallOfShame from '../WallOfShame';
import './landing.css';

const queryCache = new QueryCache({
  onError: (error, query) => {
    // only show errors for refetches. So intial error should be handled locally.
    if (query.state.data !== undefined) {
      if (error instanceof Error) toast.error(`Something went wrong ${error.message}`);
      else toast.error(`Something went wrong `);
    }
  },
});
const client = new QueryClient({ queryCache });

function IndexPageEntry(): JSX.Element {
  const { apiState, apiError } = useSubstrate();
  const [back] = useState(false);

  // Remove these when done.
  if (apiState === 'ERROR') return message(apiError);
  if (apiState !== 'READY') return loader('Connecting to Substrate');
  return (
    <div className={`root-wrap ${back ? 'background' : ''}`}>
      <QueryClientProvider contextSharing client={client}>
        <AuthProvider>
          <Router>
            <MenuBar />
            <Routes>
              <Route index element={<ProjectsRe />} />
              <Route path='/gallery' element={<Gallery />} />
              <Route path='/wall-of-shame' element={<WallOfShame />} />
              <Route path='/project/:id/*' element={<ProjectProfile />} />
              <Route path='/user/:web3Address' element={<UserProfile />} />
              <Route path='/signup' element={<SignUp />} />
              <Route path='/login' element={<Login />} />
              <Route path='*' element={message('404! Not found', true)} />
            </Routes>
          </Router>
          <Toaster position='bottom-right' />
          {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}

export default IndexPageEntry;
