/* eslint-disable import/no-unresolved */
import { AuthBtns } from 'chocolate/modules/Auth/components/AuthBtns';
import { Link } from 'react-router-dom';

export function Navlinks(): JSX.Element {
  return (
    <nav className='nav-links'>
      <Link to='/' className='nav-link nav-link__home'>
        Chocolate
      </Link>
      <ul className='nav-links-ul'>
        <li>
          <Link className='nav-link' to='/gallery'>
            Projects
          </Link>
        </li>
        <AuthBtns />
      </ul>
    </nav>
  );
}
