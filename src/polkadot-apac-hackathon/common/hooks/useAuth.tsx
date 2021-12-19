// will be more full blown, but fn returns true and a user object
// leverages useAuth and returns results from that reducer**

import { errorHandled } from 'chocolate/customComponents/utils';
import { useQuery } from 'react-query';

// a more proper impl should poll useAuth for the user object and authenticated state
// this useAuth hook can be used to get state from server and update the store in signup interaction frequently
export interface AuthState {
  isAuthenticated: boolean;
  user: {
    publicKey: string;
  };
}
type AuthStateFx = () => AuthState;
export const useAuthState: AuthStateFx = () => {
  const authCheckEndpoint = `http://localhost:${process.env.REACT_APP_AUTH_SERVER_PORT}/auth/check`;

  // poll server for auth state
  const fetchServer = async function () {
    const headers = {
      Accept: 'application/json',
    };
    const [response, err1] = await errorHandled(
      fetch(authCheckEndpoint, { method: 'GET', headers })
    );
    if (err1) {
      return {
        isAuthenticated: false,
        user: {
          publicKey: '',
        },
      };
    }
    const [data, err2] = await errorHandled<{
      success: boolean;
      user: { publicKey: string };
    }>(response.json());
    if (err2) throw err2; // sth happened with the json body, but user could be authed
    // no errors, err state and public key are trusted

    return { isAuthenticated: data.success, user: data.user };
  };
  const qry = useQuery<AuthState, Error>('auth', fetchServer, {
    refetchOnWindowFocus: true,
    // access token life??
    refetchInterval: 15000,
  });
  if (qry.isLoading) return { isAuthenticated: false, user: { publicKey: '' } };
  if (qry.isError) console.log(qry.error);
  return qry.data;
};
