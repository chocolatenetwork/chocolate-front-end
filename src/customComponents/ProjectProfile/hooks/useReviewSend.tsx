/* eslint-disable import/no-unresolved */
import { AddressOrPair } from '@polkadot/api/types';
import { SubstrateReadyCTX } from 'chocolate/Layouts/app/InnerAppProvider';
import { useContext, useState } from 'react';
import config from '../../../config';

const isDebug = config.REACT_APP_DEBUG;

type RevSend = (
  txData: { id: string; cid: string; rating: number },
  account: AddressOrPair
) => { data: string };
/** Send the actual review to chain along with cid */
const useReviewSend: RevSend = function (txData, account) {
  const { id, cid, rating } = txData;
  const { api } = useContext(SubstrateReadyCTX);
  const [fee, setFee] = useState('..loading fee..');
  const getPaymentInfo = async function () {
    const paymentInfo = await api.tx.chocolateModule
      .createReview([rating, cid], id)
      .paymentInfo(account);
    const retFee = paymentInfo.partialFee.toHuman();
    setFee(retFee);
  };
  if (account) getPaymentInfo().catch((e) => isDebug && console.error(e));
  return { data: fee };
};
export { useReviewSend };
