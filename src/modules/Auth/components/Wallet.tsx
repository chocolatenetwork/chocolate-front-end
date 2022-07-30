import { useState } from 'react';
import WalletPurple from '../../../assets/wallet-purple.svg';
import { HandleWallet } from './HandleWallet';

/**
 *
 * @description A wallet that does wallet stuff.
 * CLick to show account details in a modal or tell you to sign-up
 */
export function Wallet(): JSX.Element {
  // setup modal state
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(<></>);
  const Modal = () => modal;
  // manage modal state
  const handleModal = () => {
    setOpen((prev) => !prev);
    if (!open) {
      return setModal(<HandleWallet />);
    }
    return setModal(<></>);
  };
  // clean returns
  return (
    <section className='wallet'>
      <button type='button' className='wallet_btn' onClick={handleModal}>
        <img src={WalletPurple} alt='Wallet' className='wallet-icon' />
      </button>
      {/* Position absolute, start at leftmost part */}
      <Modal />
    </section>
  );
}
