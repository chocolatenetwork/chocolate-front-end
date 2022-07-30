import { chocolateLogo } from '../constants';
import { Loading } from '../../common/components/animation/BrownLoadingSpinner';

export const loader = (text: string, greet = false): JSX.Element => (
  <Loading message={text} img={chocolateLogo} {...{ greet }} />
);
