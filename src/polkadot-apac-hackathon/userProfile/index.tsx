import { isJsonObject } from '@polkadot/util';
import { useParams } from 'react-router-dom';
import useChainUser from '../common/hooks/useChainUser';
import Home from './Home';

const UserProfile: React.FC = function () {
  // fetch user data from chain based on w3 <points>
  const params = useParams<{ web3Address: string }>();
  const web3Address = params.web3Address ?? '';
  const {
    data,
    isLoading: isInitiallyLoading,
    ...restOfChainUserQuery
  } = useChainUser(web3Address); // Will return none for  ''
  if (!data) {
    // When no data it's either loading the query or errred. No idling.
    if (isInitiallyLoading) {
      return <p>Loading...</p>;
    }
    if (restOfChainUserQuery.isError) {
      const errMessage = restOfChainUserQuery.error.message;
      //   user doesn't exist. JSON err.
      if (isJsonObject(errMessage)) {
        const jsonErr = JSON.parse(errMessage) as { error: string }; // Extract to own type.
        return <p>Error {jsonErr.error}</p>;
      }
      // Other err.
      return <p>Error {errMessage} </p>;
    }
    // Undefined.
    return <p>Something's not right. Undefined state, user profile.</p>;
  }
  return <Home user={data} web3Addr={web3Address} />; // Web3Address must be valid if it got this far.
};
export default UserProfile;
