/* eslint-disable import/no-unresolved */
import Gallery from 'chocolate/customComponents/Gallery';
import ProjectProfile from 'chocolate/customComponents/ProjectProfile';
import ProjectsRe from 'chocolate/customComponents/ProjectsRe';
import { message } from 'chocolate/customComponents/utilities';
import WallOfShame from 'chocolate/customComponents/WallOfShame';
import Login from 'chocolate/polkadot-apac-hackathon/Auth-View/login-interaction';
import SignUp from 'chocolate/polkadot-apac-hackathon/Auth-View/sign-up-interaction';
import UserProfile from 'chocolate/polkadot-apac-hackathon/userProfile';
import { Route, Routes } from 'react-router-dom';
// Import pages and render them here
export function AppRoutes(): JSX.Element {
  return (
    <Routes>
      <Route index element={<ProjectsRe />} />
      <Route path='/gallery' element={<Gallery />} />
      <Route path='/wall-of-shame' element={<WallOfShame />} />
      <Route path='/project/:id/*' element={<ProjectProfile />} />
      <Route path='/user/:web3Address' element={<UserProfile />} />
      <Route path='/signup' element={<SignUp />} />
      <Route path='/login' element={<Login />} />
      <Route path='*' element={message('404! Not found', true)} />
    </Routes>
  );
}
