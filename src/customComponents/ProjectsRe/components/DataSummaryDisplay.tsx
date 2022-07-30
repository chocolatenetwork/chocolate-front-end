import { Link } from 'react-router-dom';
import { HumanNewProjectWithIndex } from '../../../typeSystem/jsonTypes';

// to-do: Make data types generic.
/** @description A placeholder for project view. Replace as needed */
export function DataSummaryDisplay(
  props: React.PropsWithChildren<{ data: HumanNewProjectWithIndex }>
): JSX.Element {
  const { data } = props;
  const { Id, project } = data;
  const { metadata, proposalStatus } = project;
  const { name, icon } = metadata;
  const { status } = proposalStatus;
  // turn project into a class and allow it to average out rating from reviews.
  return (
    <li role='group' className={`search-result result search-result--${status.toLowerCase()}`}>
      <img src={icon} alt='Project Logo' width='16px' height='16px' />

      <Link className='search-result__link' to={`/project/${Id.toString()}`}>
        {name}
      </Link>
      <p style={{ fontWeight: 'bold' }}>status: {status}</p>
    </li>
  );
}
