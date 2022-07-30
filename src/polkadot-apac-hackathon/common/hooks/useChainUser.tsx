import { ApiPromise } from '@polkadot/api';
// eslint-disable-next-line import/no-unresolved
import { SubstrateReadyCTX } from 'chocolate/Layouts/app/InnerAppProvider';
import { useContext } from 'react';
import type { UseQueryResult } from 'react-query';
import { useQuery } from 'react-query';
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
  const { api } = useContext(SubstrateReadyCTX);
  const queryKey = ['user', web3Address];
  return useQuery<JSONUser, Error>(queryKey, () => findUser(api, web3Address));
};
export default useChainUser;
