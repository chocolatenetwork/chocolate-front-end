/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ApiPromise } from '@polkadot/api';
import { AccountId } from '@polkadot/types/interfaces';
/* eslint-disable import/no-unresolved */
import {
  useParallelReviews,
  useReviewsSubscription,
  useReviewsWithMetadata,
} from 'chocolate/customComponents/ProjectProfile/hooks/useProject';
import {
  allCheck,
  mockImages,
  resArr,
  shouldComputeValid,
  useParallelProjects,
  useProjectsSubscription,
  useProjectsWithMetadata,
} from 'chocolate/customComponents/ProjectsRe/hooks';
import { SubstrateReadyCTX } from 'chocolate/Layouts/app/InnerAppProvider';
import { useContext, useMemo } from 'react';
import { useQuery } from 'react-query';
import { ProjectID } from '../../../interfaces';
import { useSubstrate } from '../../../substrate-lib';
import {
  HumanNewProjectWithIndex,
  HumanNewReview,
  HumanTableSetReview,
  ReviewKeyAl,
} from '../../../typeSystem/jsonTypes';

// Get related review keys from chain
// use a validator to ensure w3 addr before continuing.
// How do we express the state of this outer query? I.e what happens if useRelatedKeys fails when user doesn't exist, etc?
// Use a filter like project profile page.
const getKeys = async function (api: ApiPromise, web3Address: AccountId | string) {
  // Filter keys by accountId
  const allKeys = await api.query.chocolateModule.reviews.keys(web3Address);
  // Return raw keys
  const raw = allKeys.map((each) => each.args);
  return raw;
};
const useRelatedKeys = function (api: ApiPromise, web3Address: AccountId | string) {
  return useQuery(['Reviews', web3Address.toString()], () => getKeys(api, web3Address));
};
/** Takes the projects fetched and the reviews fetched, and attaches project metadata to the reviews
 * Worry: One may finish before the other leading to wait.
 * How to represent waiting??
 */
const consolidateMetas = function (
  revMetas: HumanNewReview[],
  prMetas: HumanNewProjectWithIndex[]
) {
  const merged = revMetas
    .map((each) => {
      // Map to table rev
      // Find associated project
      const relatedPr = prMetas.find((v) => v.Id === each.projectID); // Careful for overflow. Both are strings actually.
      if (!relatedPr) return;
      return { ...each, project: relatedPr.project } as HumanTableSetReview;
    })
    .filter((each) => !!each);
  return merged;
};
/**
 * An abstraction over the first query which and gets all projects associated with this user.
 * Returns: [NewProjectWithIndex[], anyMetaErr,anyMetaInitiallyLoading,isAllIdle]
 * This doesn't consider fallback yet.
 */
const useRelatedProjects = function (
  api: ApiPromise,
  prKeys: ProjectID[] | undefined,
  isKeySuccess: boolean
) {
  // Query 1: Set off fetching projects
  // These are two queries that can run concurrently, to be merged in the end
  const parallelProjects = useParallelProjects(api, prKeys ?? [], isKeySuccess);
  const projectParallels = useMemo(() => shouldComputeValid(parallelProjects), [parallelProjects]);
  // Check defined
  const validProjectParallels = projectParallels[0];
  const readyProjectParallels = useMemo(
    () => resArr(validProjectParallels),
    [validProjectParallels]
  );
  // Ideally this subscription should come after every project has completed too and we have keys
  useProjectsSubscription(
    api,
    prKeys ?? [],
    isKeySuccess && allCheck(projectParallels[3], 'success')
  );
  // Metas should give enough time for parallel projects to complete fetching
  const prMetas = useProjectsWithMetadata(
    readyProjectParallels,
    allCheck(projectParallels[3], 'success')
  );
  // Same routine for qs
  const vPrMetaArr = useMemo(() => shouldComputeValid(prMetas), [prMetas]);
  const [validPrMetas, anyPrMetaErr, anyPrMetaInitiallyLoading, prMetaStates] = vPrMetaArr;
  const readyPrMetas = useMemo(() => resArr(validPrMetas).map(mockImages), [validPrMetas]);
  return [
    readyPrMetas,
    anyPrMetaErr,
    anyPrMetaInitiallyLoading,
    allCheck(prMetaStates, 'idle'),
  ] as [HumanNewProjectWithIndex[], boolean, boolean, boolean];
};
/**
 * Uses context of parent (Including fallback and keys) to fetch reviews related to a user in the same pattern as used elsewhere in this app.
 * Returns [NewReview[], anyMetaErr,anyMetaInitiallyLoading,isAllIdle]
 */
const useRelatedReviews = function (
  api: ApiPromise,
  usersKeys: ReviewKeyAl[] | undefined,
  isKeySuccess: boolean,
  fallback: boolean
) {
  const parallelReviews = useParallelReviews(api, usersKeys ?? [], isKeySuccess && !fallback);
  const reviewParallels = useMemo(() => shouldComputeValid(parallelReviews), [parallelReviews]);
  // Check defined
  const validParallels = reviewParallels[0];
  const readyParallels = useMemo(() => resArr(validParallels), [validParallels]);
  // Subscribe after fetched structs and keys, too
  useReviewsSubscription(
    api,
    usersKeys ?? [],
    isKeySuccess && allCheck(reviewParallels[3], 'success') && !fallback
  );
  // Next, start fetching metadatas.
  // Metas should give enough time for parallel reviews to complete fetching
  const revMetas = useReviewsWithMetadata(readyParallels, allCheck(reviewParallels[3], 'success'));
  // Same routine for qs
  const vRevMetaArr = useMemo(() => shouldComputeValid(revMetas), [revMetas]);
  const [validMetas, anyRevMetaErr, anyRevMetaInitiallyLoading, revMetaStates] = vRevMetaArr;
  const readyRevMetas = useMemo(() => resArr(validMetas), [validMetas]);
  return [
    readyRevMetas,
    anyRevMetaErr,
    anyRevMetaInitiallyLoading,
    allCheck(revMetaStates, 'idle'),
  ] as [HumanNewReview[], boolean, boolean, boolean];
};
/**
 * This hook culminates work from useProjects and useSearchData by calling subhooks of each to fetch all reviews related to a user and the related projects, merging them into search data for the user's stats table.
 * All of this can be cleaned up better especially since a lot of the logic is similar between here and useProject. Too much duplication.
 *
 * Returns: [TableSetReview[], anyMetaErr,anyMetaInitiallyLoading,isEitherCompletelyIdle]
 */
export const useUserReviews = function (web3Address: string) {
  const { apiState } = useSubstrate();
  const { api } = useContext(SubstrateReadyCTX);
  const fallback = apiState !== 'READY';
  // Fetch review keys
  const { data: usersKeys, isSuccess: isKeySuccess } = useRelatedKeys(api, web3Address); // isSuccess mirrors state var. safe to use.
  const prKeys: ProjectID[] | undefined = usersKeys?.map((each) => each[1]);

  // Query 1: Set off fetching projects
  // These are two queries that can run concurrently, to be merged in the end
  const [readyPrMetas, anyPrMetaErr, anyPrMetaInitiallyLoading, areAllPrsIdle] = useRelatedProjects(
    api,
    prKeys,
    isKeySuccess
  );

  // Query 2: Set off fetching reviews
  const [readyRevMetas, anyRevMetaErr, anyRevMetaInitiallyLoading, areAllRevsIdle] =
    useRelatedReviews(api, usersKeys, isKeySuccess, fallback);

  // Consolidate states and return final state of the query.
  const finalTableData = consolidateMetas(readyRevMetas, readyPrMetas);
  const anyMetaErr = anyRevMetaErr || anyPrMetaErr;
  const anyMetaInitiallyLoading = anyRevMetaInitiallyLoading || anyPrMetaInitiallyLoading;
  const isEitherCompletelyIdle = areAllRevsIdle || areAllPrsIdle; // Should it be && to represent strict allIdle?

  // Outer interface
  return [
    finalTableData,
    anyMetaErr,
    anyMetaInitiallyLoading,
    // UI reacts when metadata available
    isEitherCompletelyIdle,
  ] as [HumanTableSetReview[], boolean, boolean, boolean];
};
