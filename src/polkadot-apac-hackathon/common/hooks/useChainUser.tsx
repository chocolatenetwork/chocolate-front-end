import { ApiPromise } from '@polkadot/api';
import { useQuery } from 'react-query';
import type { UseQueryResult } from 'react-query';
import { useSubstrate } from '../../../substrate-lib';
import { JSONUser } from '../../../typeSystem/jsonTypes';

const findUser = async (api: ApiPromise, web3Address: string) => {
  const user = await api.query.usersModule.users(web3Address);
  if (user.isNone) {
    throw new Error(JSON.stringify({ error: 'User does not exist' }));
  }
  const chainUser = user.unwrapOrDefault();
  const jsonUser = chainUser.toJSON() as unknown as JSONUser;
  return jsonUser;
};
const useChainUser = (web3Address: string): UseQueryResult<JSONUser, Error> => {
  const { api } = useSubstrate();
  const queryKey = ['user', web3Address];
  return useQuery<JSONUser, Error>(queryKey, () => findUser(api, web3Address));
};
export default useChainUser;
