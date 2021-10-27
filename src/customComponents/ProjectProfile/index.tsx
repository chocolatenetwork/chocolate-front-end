import { message } from 'chocolate/App';
import { ProjectAl } from 'chocolate/interfaces';
import { useParams } from 'react-router-dom';
import { filter } from './majorUtils';
import useProject from './useProject';
import useProjectMeta from './useProjectMeta';
import useReviews from './useReviews';

const ProjectProfile: React.FC<{ data: ProjectAl; id: string }> = function (
  props
) {
  const { data, id } = props;
  // race!
  const { data: reviews, isLoading: lrev } = useReviews(data, id);
  const { data: projectMeta, isLoading: lprm } = useProjectMeta(data, id);
  return <h1>Finally, some data fetching, loading? {lrev ? 'Yes' : 'No'} </h1>;
};
const Main: React.FC = function () {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useProject(id);
  if (isLoading) return <i className='ui loader' />;
  const four = message('Error, project not found', true);
  if (data === 0) return four;
  const re = filter(data);
  if (re !== 2) {
    if (re === 0)
      return (
        <p>
          This project has been rejected from the chocolate ecosystem due to{' '}
          {data.proposalStatus.reason.toHuman()}
        </p>
      );
    if (re === 1) return <p>This project is currently proposed</p>;
    return four;
  }
  return <ProjectProfile data={data} id={id} />;
};

export default Main;