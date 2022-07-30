// eslint-disable-next-line no-use-before-define
import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Image, Loader, Message, Modal } from 'semantic-ui-react';
import config from '../../config';
import { Rating } from '../Projects';
import { useApp } from '../state';
import { loader } from '../utilities';
import { message } from '../utilities/message';
import { ReviewSingle } from './components/ReviewSingle';
import { SubmitReviewForm } from './components/SubmitReviewForm';
import { useProject } from './hooks';
import { noPrjErr, useProfileData, useReelData } from './hooks/useProject';
import './profile.css';
import { ProfileSum, PrProf, RevReel, SumRev } from './types';

const isDebug = config.REACT_APP_DEBUG;

const ProjectProfileSummary: ProfileSum = function (props) {
  const { profileQ } = props;
  const { data: profile, isIdle, isLoading: isInitiallyLoading, isError } = profileQ;
  // Do proper error handling for each state
  if (!profile) {
    if (isIdle) {
      // User still sees loading. Only change/add ctx if fallback
      return <Loader content='Loading...' />;
    }
    if (isInitiallyLoading) {
      // same as above
      return <Loader content='Loading...' />;
    }
    if (isError) {
      // Only one is fetch error. For simplicity have a little warning sign. NFound is for large spaces.
      return <Message error content='Error fetching project' />;
    }
    // Catch all
    return <Message error content='Undefined state ProjectProfileSummary' />;
  }
  // Then do necessary displays
  const { name, Link: maybeSite, description } = profile.project.metadata;
  const { totalReviewScore, numberOfReviews } = profile.project;
  const src = `https://avatars.dicebear.com/api/initials/${name}.svg`;
  const ave = Number(totalReviewScore) / Number(numberOfReviews);
  const site = maybeSite ?? '#'; // not polyfilled. Remove when test data is sanitised.
  return (
    <article className='head-profile'>
      <section className='left'>
        <Rating rating={ave} fixed />
        <Image alt='project logo' className='project-logo' wrapped rounded src={src} ui={false} />
      </section>

      <section className='right'>
        <h2 className='About'>About</h2>
        <p className='about_reviewer'>{description}</p>
        <div className='ui two mini buttons'>
          <Button as='a' color='purple' href={site} className='wh_top'>
            Website
          </Button>
          <Button as='a' color='purple' href={`${site}/whitepaper`} className='wh_top'>
            Whitepaper
          </Button>
        </div>
      </section>
    </article>
  );
};

type Stages = '1' | '2' | '3' | '4';
const SubmitReview: SumRev = function (props) {
  const { disabled, proj } = props;
  const [open, setOpen] = useState(false);
  const reason =
    "You cannot submit a review, this is probably because you, or your selected account owns this project or you've been banned";
  let content;

  // initial stage for interactive modal. Run only once
  // pathfor interactive modal
  const params = useParams<{ id: string; '*'?: `/stage/${Stages}` }>();
  const id = proj[1].toHuman();
  const init = /stage\/[1234]/.test(params['*'] ?? '');
  const navigate = useNavigate();
  useEffect(() => {
    if (open) {
      if (!init) {
        navigate(`/project/${id}/stage/1`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  useEffect(() => {
    if (init) {
      if (!open) {
        // React error that input el is controlled
        setOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (disabled)
    content = (
      <Button color='purple' disabled fluid>
        Submit review
      </Button>
    );
  else {
    content = (
      <Modal
        closeIcon
        onClose={() => {
          setOpen(false);
          navigate(`/project/${id}`);
        }}
        onOpen={() => setOpen(true)}
        open={open}
        trigger={
          <Button color='purple' className='purple' fluid>
            Submit a review
          </Button>
        }
      >
        <Modal.Header>Submit review</Modal.Header>
        <Modal.Content>
          <Routes>
            <Route path='stage/:stage' element={<SubmitReviewForm proj={proj} />} />
          </Routes>
        </Modal.Content>
      </Modal>
    );
  }
  return <div title={disabled ? reason : undefined}>{content}</div>;
};

const ReviewReel: RevReel = function (props) {
  /**  [reviews,anyErred, anyInitiallyLoading, allIdle] */
  const { reelData } = props;
  // Use NFound to express loading, and error states here.
  const [reviews, anyErred, anyInitiallyLoading, allIdle] = reelData;

  /** Begin UI states */
  // Loading intially...
  let L = <></>;

  if (anyInitiallyLoading) {
    L = loader('Fetching reviews...');
  }
  if (allIdle) {
    // treat same as loading. Special notification if in fallback
    L = loader('Fetching reviews...');
  }
  // Partial error, chance of fallback activating here
  let E = <></>;
  if (reviews.length === 0 && anyErred) {
    // If allErred and none exist, show fail screen. Else, UI will show fallback and we assume that it's fetching
    // Mutex
    L = <></>;
    E = message('Error fetching reviews');
  }
  // Complete error
  // if(allErred){
  //   L = () => <></>;
  //   E = ()=>message("Error fetching reviews"); // Refresh page button.
  // }
  // Fallback state
  // if(isFallback){
  //   F = () => toggleFallbackUI. Or component can do that itself
  // }
  const renderContent = reviews.map((each) => (
    <ReviewSingle each={each} key={JSON.stringify(each)} />
  ));

  return (
    <article className='review_bttm '>
      {/* Include banner if in fallback */}
      <h2 className='About review_header card-list'>Reviews</h2>
      <Card.Group className='box_indiv'>{renderContent}</Card.Group>
      {L}
      {E}
    </article>
  );
};
/**
 *
 * @description This component will take over ReviewReel after finishing the useReview top level hook.
 * It will do a better job at error handling, falling back with the api, and
 */
// const NewReviewReel = function (props) {};
const ProjectProfile: PrProf = function (props) {
  const { data, proj } = props;
  const { state } = useApp();
  const { userData } = state;
  const { accountAddress: addr } = userData;
  // error handle
  let canReview = true;
  if (data.ownerID.eq(addr)) canReview = false;

  // The resulting list can then be rendered by the ReviewReel component.
  // Generally, for the state machine, rendering priority happens like this: 1. if there's an error and reviews are unavailable, render err msg.
  // 2. If the error is the api is unavailable, turn on fallback mode for everyone (Arg should be passed from parent since it doesn't touch api directly).
  // 3. If the error is all queries failed, show a definitive error.
  // 4. If we're in initial loading state (i.e all idle or loadingInitially), show a final loading component as reviews are loaded in.
  // 5. If we're done and the list is empty, show good ol' NFound.
  // 6. Default to rendering the list of review cards

  // Test. Note: Calculating on the fly isn't efficient, this should be handled onchain.
  /**  [reviews,anyErred, anyInitiallyLoading, allIdle] */
  const reviewQ = useReelData(proj);
  const profileQ = useProfileData(proj);
  return (
    <main className='profile-wrap'>
      <ProjectProfileSummary profileQ={profileQ} />
      <SubmitReview disabled={!canReview} proj={proj} />
      <ReviewReel reelData={reviewQ} />
    </main>
  );
};

/**
 * This component handles the initial fetch of the project, loading state UI of the ProjectAl, and sorting them. It's an initial page-wide blanket of <NFound/>
 */
const Main: React.FC = function () {
  const params = useParams<{ id: string }>();
  const id = params.id ?? '';
  // Perfectly fine to pass empty id, will default to  0 when U32 is created, leaving none as long as project 0 doesn't exist
  const { data, isLoading: isInitiallyLoading, isIdle, ...restOfProjectQuery } = useProject(id);
  if (!data) {
    // Ref: https://react-query.tanstack.com/reference/useQuery
    // Three states of concern: Idle
    if (isIdle) {
      // Only possible in fallback.
      return loader('Waiting for Chain connection...'); // Make a more subtle loader.
    }
    // Loading for the first time,
    if (isInitiallyLoading) return loader('Fetching project..');
    // or erred
    if (restOfProjectQuery.isError) {
      if (restOfProjectQuery.error.message === noPrjErr)
        return message('Error, project not found', true);
      return message('something went wrong fetching data from the api'); // Make err More subtle, possibly with NFound.
    }
    return message('Undefined state, Project profile');
  }
  if (isDebug) console.assert(data, 'Data undefined in project profile main');
  if (data[0].proposalStatus.status.isRejected)
    return (
      <p>
        This project has been rejected from the chocolate ecosystem due to being{' '}
        {data[0].proposalStatus.reason.toString()}
      </p>
    );
  if (data[0].proposalStatus.status.isProposed) return <p>This project is currently proposed</p>;
  return <ProjectProfile data={data[0]} id={data[1].toString()} proj={data} />;
};

export default Main;
