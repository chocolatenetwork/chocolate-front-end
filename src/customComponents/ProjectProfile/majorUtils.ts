import IPFS from 'ipfs-http-client';
import type { ClientOptions } from 'ipfs-http-client/src/lib/core';
import config from '../../config';
import { PinServerRes } from '../../typeSystem/appTypes';
import { ReviewContent } from '../../typeSystem/jsonTypes';
import { errorHandled } from '../utils';
// for use with ipfs cat
/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line no-unused-vars
const plainUrl = new URL(config.IPFS_API_SERVER);
const ipfsConfig = {
  protocol: plainUrl.protocol,
  host: plainUrl.hostname,
  port: Number(plainUrl.port),
  apiPath: 'api/v0',
} as ClientOptions;

type GetCidReturns = { cid: string };
async function devGetCid(reviewText: string, rating: number): Promise<GetCidReturns> {
  const node = IPFS(ipfsConfig);
  const cacheable: ReviewContent = { reviewText, rating };

  const addRes = await node.add(JSON.stringify(cacheable));
  const subdomainSafeCid = addRes.cid.toV1().toString('base36');
  return { cid: subdomainSafeCid };
}
const getCid = async function (reviewText: string, rating: number): Promise<GetCidReturns> {
  if (process.env.NODE_ENV === 'development') return devGetCid(reviewText, rating);
  const cacheable: ReviewContent = { reviewText, rating };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const endpoint = config.IPFS_ADD_PINNED_URL;
  const headers = {
    method: 'POST',
    body: JSON.stringify(cacheable),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };
  const [cid, err] = await errorHandled(fetch(endpoint, headers));
  if (err) throw err;
  const ccid = (await cid.json()) as PinServerRes;
  const returnable = ccid?.success;
  return { cid: returnable };
};
export { getCid };
