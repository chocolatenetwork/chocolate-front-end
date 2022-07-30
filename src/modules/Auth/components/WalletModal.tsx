import { useState } from 'react';
import AccountSelector from '../../../AccountSelector';
import { useSubstrate } from '../../../substrate-lib/SubstrateContext';
import { useLoadAccounts } from '../hooks/useLoadAccounts';

/**
 * @description - A modal that either shows wallet info - account
 * selected and balances - rankpoints and regular, or it shows connect depending on wallet connection.
 */
export function WalletModal(props: { connected?: boolean }): JSX.Element {
  const { connected } = props;
  const { keyringState } = useSubstrate();
  const [run, setRun] = useState(false);
  useLoadAccounts(run, setRun);
  let content;
  // do the keyring stuff here too.
  if (keyringState === 'LOADING') content = <p>Loading... </p>;
  else if (keyringState === 'ERROR') content = <p>Something went wrong, please refresh the page</p>;
  else if (!connected) {
    content = (
      <>
        <p>Your wallet is not connected, do connect</p>
        <button type='button' onClick={() => setRun(true)}>
          Connect wallet
        </button>
      </>
    );
  } else {
    content = <AccountSelector />;
  }

  return <div className='modal modal_drop modal_drop--right'>{content}</div>;
}
