import { Wallet } from '../../modules/Auth/components/Wallet';
import './index.css';
import { Navlinks } from './Navlinks';
import './wallet.css';

const Menu = function (): JSX.Element {
  return (
    <header className='top-nav'>
      <Navlinks />
      <Wallet />
    </header>
  );
};
export default Menu;
