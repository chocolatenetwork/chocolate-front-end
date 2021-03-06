import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Loader } from 'semantic-ui-react';
import { useCid } from '../hooks';
import type { CacheAction, Stage1Cache } from './SubmitReviewForm';

export interface CheckCidProps extends Stage1Cache {
  isAuthenticated: boolean;
  dispatchCache: React.Dispatch<CacheAction>;
}

const CheckAuthAndGetCid: React.FC<CheckCidProps> = function (props) {
  // first, check if auth
  const { isAuthenticated, comment, rating, dispatchCache } = props;
  // if auth, get cid
  const { isLoading, isError, data } = useCid(isAuthenticated, comment, rating);
  // id for later
  const { id } = useParams<{ id: string }>();
  // next
  const [next, setNext] = useState<boolean>(false);
  const navigate = useNavigate();
  useEffect(() => {
    // dispatch next action only if cid is available
    if (!data) {
      return;
    }
    const { cid } = data;
    dispatchCache({ type: 'stage2', stage2: cid, id });
    // then go to next
    setNext(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isError, data, id]);

  if (next) navigate(`/project/${id}/stage/3`);

  return (
    <Container fluid>
      <p>Fetching your review's cid...</p>
      <Loader />
    </Container>
  );
};
export { CheckAuthAndGetCid };
