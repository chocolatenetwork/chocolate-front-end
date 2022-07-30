/* eslint-disable import/no-unresolved */
import { useAuthService } from 'chocolate/polkadot-apac-hackathon/common/providers/authProvider';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from 'react-query';
import { Link } from 'react-router-dom';
import { LOGOUT_MUTATION } from '../utils';

/** These are used to Authenticate the user from the navbar  */
export function AuthBtns(): JSX.Element {
  const { isAuthenticated, logout } = useAuthService();
  const logoutMutation = useMutation(LOGOUT_MUTATION);
  if (logoutMutation.error) {
    toast.error('Something went wrong logging you out.');
    logoutMutation.reset();
  }
  useEffect(() => {
    if (logoutMutation.status === 'success') {
      logout();
      logoutMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logoutMutation.status]);

  if (isAuthenticated)
    return (
      <li>
        <button
          type='button'
          onClick={logoutMutation.mutate as VoidFunction}
          className='ui button purple nav-link'
        >
          Logout
        </button>
      </li>
    );

  return (
    <>
      <li>
        <Link className='nav-link' to='/login'>
          Login
        </Link>
      </li>
      <li>
        <Link className='nav-link' to='/signup'>
          Sign up
        </Link>
      </li>
    </>
  );
}
