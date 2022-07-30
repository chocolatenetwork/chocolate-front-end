// eslint-disable-next-line import/no-unresolved
import { SubstrateReadyCTX } from 'chocolate/Layouts/app/InnerAppProvider';
import { useContext } from 'react';
import { ProjectsView } from '../Projects';
import { useSearchData } from '../ProjectsRe/hooks';

function WallOfShame(): JSX.Element {
  const { api } = useContext(SubstrateReadyCTX);
  const [data] = useSearchData(api);
  return <ProjectsView shame data={data} />;
}

export default WallOfShame;
