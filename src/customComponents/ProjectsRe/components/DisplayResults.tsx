import { HumanNewProjectWithIndex } from '../../../typeSystem/jsonTypes';
import { DataSummaryDisplay } from './DataSummaryDisplay';

/** @description - A placeholder for projects view. Replace as needed */
export function DisplayResults(
  props: React.PropsWithChildren<{
    data: HumanNewProjectWithIndex[];
    found: boolean;
  }>
): JSX.Element {
  const { data, found } = props;
  // take project name, image, status.
  let content: JSX.Element | JSX.Element[];
  if (!found) {
    content = (
      <>
        <p className='result'>Sorry, no results were found</p>
      </>
    );
  } else {
    // paginate for memory.
    content = data.map((each) => <DataSummaryDisplay key={JSON.stringify(each)} data={each} />);
  }
  return <ul className='ui results transition visible search-results'>{content}</ul>;
}
