import { useEffect, useState } from 'react';
import { useSubstrate } from '../../../substrate-lib/SubstrateContext';
import { WalletModal } from './WalletModal';

/**
 * @description It should check if connected or not.
 * If wallet is connected, show a dropdown that shows accountSelected and balances.
 * If wallet is not collected, show dropdown with connectWallet button.
 *
 */
export function HandleWallet(): JSX.Element {
  const { keyringState } = useSubstrate();
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    if (keyringState === 'READY') setConnected(true);
  }, [connected, keyringState]);

  if (connected || keyringState === 'READY') {
    return <WalletModal connected />;
  }
  return <WalletModal />;
}
