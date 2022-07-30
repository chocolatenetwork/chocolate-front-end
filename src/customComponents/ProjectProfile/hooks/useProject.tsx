/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { ApiPromise } from '@polkadot/api';
import { VoidFn } from '@polkadot/api/types';
import { Option, U32 } from '@polkadot/types';
import { SubstrateReadyCTX } from 'chocolate/Layouts/app/InnerAppProvider';
import {
  HumanChainProject,
  HumanChainReview,
  HumanNewProjectWithIndex,
  HumanNewReview,
  NewMetaData,
  ReviewContent,
  ReviewKeyAl,
} from 'chocolate/typeSystem/jsonTypes';
/* eslint-enable import/no-unresolved */
import { useContext, useEffect, useMemo } from 'react';
import { useQueries, useQuery, useQueryClient, UseQueryResult } from 'react-query';
import config from '../../../config';
import { ProjectAl, ProjectID, ReviewAl } from '../../../interfaces';
import { useSubstrate } from '../../../substrate-lib';
import { allCheck, resArr, shouldComputeValid } from '../../ProjectsRe/hooks';
import { errorHandled, limitedPinataFetch } from '../../utils';

const isDebug = config.REACT_APP_DEBUG;

type MaybeSubscribe =
  | { pair: [ProjectAl, ProjectID]; shouldFire: true }
  | { pair: undefined; shouldFire: false };
/**
 * Then deal with websockets
 * Fallback here would be shouldFire && !fallback
 * It should wait for project to have fetched. Specialisation of useProjectsSubscription
 */
const useProjectSubscription = function (api: ApiPromise, maybePair: MaybeSubscribe) {
  const queryClient = useQueryClient();
  //  Subscribe once, more efficient with connections.
  useEffect(() => {
    let unsub: VoidFn;
    // Key should be available now.
    if (maybePair.shouldFire) {
      const key = maybePair.pair[1];

      api.query.chocolateModule
        .projects<Option<ProjectAl>>(key, (pr) => {
          const ithProject = pr.unwrapOrDefault();
          queryClient.setQueryData<[ProjectAl, ProjectID]>(
            ['Project', key.toJSON()],
            (checkAgainst) => {
              if (!checkAgainst) {
                if (isDebug)
                  console.error('Set query data before initial query', key.toJSON(), ithProject);
                return [ithProject, key.toJSON()];
              }
              const [project, id] = checkAgainst;
              // Concrete check
              if (key.eq(id)) {
                return [ithProject, id];
              }
              return [project, id];
            }
          );
        })
        .then((v) => (unsub = v))
        .catch((e) => isDebug && console.error(e));
    }
    return () => unsub && unsub();

    // Passing api ensures refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, maybePair.shouldFire]);
};

// Share
export const noPrjErr = 'Project not found';
/**
 * @description Fetches an instance of project from chain,
 * Since we have ser version of the key here, this is a specification of useParallelProjects.
 * Like the other, it should memoise.
 * At the very least, have a shouldFire that stops the query if something is wrong
 */
const useSingleProject = function (api: ApiPromise, id: string, shouldFire: boolean) {
  const getOne = async function (key: ProjectID) {
    const proj = await api.query.chocolateModule.projects(key);
    if (proj.isNone) {
      throw new Error(noPrjErr);
    }
    // Returning key allows us to track project later
    return [proj.unwrapOrDefault(), key] as [ProjectAl, ProjectID];
  };
  const u = new U32(api.registry, id);
  return useQuery<[ProjectAl, ProjectID], Error>({
    queryKey: ['Project', u.toJSON()],
    queryFn: () => getOne(u),
    enabled: shouldFire,
    // We'll refetch
    staleTime: Infinity,
  });
};
/**
 * @description  Actual logic for outer project component
 * Refactor later on for better err handling
 * NB: Project query returned could be undef. Handle that case.
 */
export default function useProject(id: string): UseQueryResult<[ProjectAl, ProjectID], Error> {
  const { apiState } = useSubstrate();
  const { api } = useContext(SubstrateReadyCTX);
  const isFallback = apiState !== 'READY';
  // Call from chain.
  const project = useSingleProject(api, id, !isFallback);

  // Wait for success and setup sub.
  // Handle case where project isn't defined
  const maybePair = {
    pair: project.data,
    shouldFire: project.status === 'success',
  } as MaybeSubscribe;
  useProjectSubscription(api, maybePair);
  // Return og interface. Caller should handle undef.
  return project;
}
// Removed to try and fix err. Issue: Same endpoint being queried accross multiple fxs, hence breaking rate limit.
// Fix: Include some randomness so the queries go out of sync
const retrieveProjectMeta = async function ([pr, id]: [ProjectAl, ProjectID]) {
  // Get metadata
  const res = await errorHandled(limitedPinataFetch(pr.metadata.toJSON()));
  if (res[1]) throw res[1];
  const json = await errorHandled<NewMetaData>(res[0].json());
  if (json[1]) throw json[1];

  //  Merge metadata in.
  // First, json stringify (This should be handled by a wrapper class)
  const prString = pr.toHuman() as unknown as HumanChainProject;
  const nPr = {
    Id: id.toHuman(),
    project: { ...prString, metadata: json[0] },
  } as HumanNewProjectWithIndex;
  return nPr;
};
/**
 *
 * The shouldFire here depends on useSingleProject.
 * Since it's split, we simply pass the result of the query, assuming err handling is done by parent
 * Project with metadata must wait for Project to fetch. I.e shouldFire = data.status === "success", or in this case, !!data
 */
const useProjectWithMetadata = function ([v, k]: [ProjectAl, ProjectID], shouldFire: boolean) {
  return useQuery({
    // Concern: Using metadata CID could produce redundant queries if changes happen frequently.
    queryKey: ['Project', 'Metadata', k.toJSON(), v.metadata.toJSON()],
    queryFn: () => retrieveProjectMeta([v, k]),
    enabled: shouldFire,
    staleTime: Infinity,
  });
};

// Now, reviews. First, get the keys
/**
 * Gets review keys associated with a project by filtering id. Similar to useProjectKeys
 * ToDO: Memoise for #fallbackCompliance
 */
const useReviewKeys = function (api: ApiPromise, id: ProjectID) {
  const serKeys = async () => {
    // ToDo: Smartly, this should be an infinite query with pagination, deal with later.
    const keys = await api.query.chocolateModule.reviews.keys();
    return keys.map((key) => key.args).filter((each) => each[1].eq(id));
  };
  return useQuery(['Review Keys', id.toJSON()], serKeys, {
    // Reasonably, every block-time
    refetchInterval: 6500,
  });
};

// Share
export const noRevErr = 'Review not found';
// Get the structs via a similar method
/**
 * Key strctr: [ReviewAl,[AccountId,ProjectID]]
 * Query strctr: ["Review",ProjectID,AccountId]
 * Its shouldFire depends on useReviewKeys completing successfully and the api being available.
 * Presumably, shouldFire would satisfy fallbackCompliance as that would disable the query, avoiding retries from err.
 * #fallbackCompliant. If the queries never fire, the others will wait. If the queries have fired, they won't retry if erred. Else it's up to the others to handle fallout
 */
export const useParallelReviews = function (
  api: ApiPromise,
  keys: ReviewKeyAl[],
  shouldFire: boolean
) {
  const getOne = async function (key: ReviewKeyAl) {
    const rev = await api.query.chocolateModule.reviews(key[0], key[1]);
    // Short err handle. Doesn't matter in the scope of things though.
    if (rev.isNone) {
      throw new Error(noRevErr);
    }
    // Returning key allows us to track review later
    return [rev.unwrapOrDefault(), key] as [ReviewAl, ReviewKeyAl];
  };

  const reviews = useQueries(
    keys.map((each) => ({
      queryKey: ['Review', each[1].toJSON(), each[0].toJSON()],
      queryFn: () => getOne(each),
      enabled: shouldFire,
      // We'll refetch
      staleTime: Infinity,
    }))
  );
  return reviews;
};
// Now that we have the reviews, we can subscribe (Again, limit this from the outside, and in here to 20 per page)
/**
 * Dealing with ws.
 * Fallback here would be shouldFire && !fallback (Both can be combined into shouldFire from outside).
 * Also, same dep as earlier.
 * This time, include api in useEffect dependency for realtime updates.
 */
export const useReviewsSubscription = function (
  api: ApiPromise,
  keys: ReviewKeyAl[],
  shouldFire: boolean
) {
  const queryClient = useQueryClient();
  useEffect(() => {
    let unsub: VoidFn;
    if (shouldFire)
      api.query.chocolateModule.reviews
        .multi<Option<ReviewAl>>(keys, (prs) => {
          keys.forEach((key, index) => {
            const ithReview = prs[index].unwrapOrDefault();

            queryClient.setQueryData<[ReviewAl, ReviewKeyAl]>(
              ['Review', key[1].toJSON(), key[0].toJSON()],
              (checkAgainst) => {
                if (!checkAgainst) {
                  if (isDebug) console.error('Set query data before initial query', key, ithReview);
                  return [ithReview, key];
                }
                const [review, id] = checkAgainst;
                // Concrete check. Keys should match and the struct should change.
                const shouldUpdate = key[0].eq(id[0]) && key[1].eq(id[1]) && !review.eq(ithReview);
                if (shouldUpdate) {
                  return [ithReview, id];
                }
                return [review, id];
              }
            );
          });
        })
        .then((v) => (unsub = v))
        .catch((e) => isDebug && console.error(e));
    return () => unsub && unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, keys.length, shouldFire]);
};
// and find the metdata.

/**  Fetch fx for next hook. Extracted to try and fix sync err. */
const retrieveReviewMeta = async function ([rev]: [ReviewAl, ReviewKeyAl]) {
  // Get metadata
  const res = await errorHandled(limitedPinataFetch(rev.content.toJSON()));
  if (res[1]) throw res[1];
  const json = await errorHandled<ReviewContent>(res[0].json());
  if (json[1]) throw json[1];

  //  Merge metadata in.
  // First, json stringify (This should be handled by a wrapper class)
  const revString = rev.toHuman() as unknown as HumanChainReview;
  const nRv = { ...revString, content: json[0] } as HumanNewReview;
  return nRv;
};
/**
 * Gets metadata associated with reviews.
 * #fallbackCompliant since it doesn't require api. Also, as called in useReviewReels, it works even if reviews array is empty (ui can handle final effect.)
 * */
export const useReviewsWithMetadata = function (
  reviews: [ReviewAl, ReviewKeyAl][],
  shouldFire: boolean
) {
  return useQueries(
    reviews.map(([v, k]) => ({
      // Same concern about depracation. Use ownerId instead. Don't want to leave old.
      queryKey: ['Review', 'Metadata', k[1].toJSON(), k[0].toJSON(), v.content.toJSON()],
      queryFn: () => retrieveReviewMeta([v, k]),
      enabled: shouldFire,
      staleTime: Infinity,
    }))
  );
};

// Compose the project metadata into one place
/**
 * ToDO: Replace useProjectMeta with this
 * Returns the metadata query with key statuses for use in project UI.
 * Returns a query for the project's metadata after subscribing.
 *
 * Treat the data as: {qry, isInitiallyLoading, isError,state(check for success)}.
 * main err handling will happen in isInitiallyLoading and isError.
 * This is independent of the api for now, so caching is sufficient.
 * #fallbackCompliant
 */
export const useProfileData = function (project: [ProjectAl, ProjectID]) {
  // First, fetch the metdata from this. Simple err handling if the main component doesn't already handle all.
  const meta = useProjectWithMetadata(project, !!project);
  return meta;
};

// Compose review data into one place.
/**
 * This fetches all associated review in parallel, serialising it like searchData, but this time subscribing as due to the chain.
 * For this to be fallback compliant, every participating hook must be fallback compliant and the passing component for the project must also be (I.e args are independent of api being available and the hook isn't called at all if args aren't).
 * Nb: We also assume, in this hook's component (Profile), that surrounding component properly passes the project. Hence why it isn't undefined
 * Returns [reviews,anyErred, anyInitiallyLoading, allIdle] so UI can react appropriately with nice messages. :wink:
 */
export const useReelData = function (project: [ProjectAl, ProjectID]) {
  const { apiState } = useSubstrate();
  const { api } = useContext(SubstrateReadyCTX);
  // First use of fallback
  const fallback = apiState !== 'READY';
  // First, get the keys, And Use this as trigger for structs
  const { data: keys, status } = useReviewKeys(api, project[1]);
  const parallelReviews = useParallelReviews(api, keys ?? [], status === 'success' && !fallback);
  // Then incrementally calc.
  const parallels = useMemo(() => shouldComputeValid(parallelReviews), [parallelReviews]);
  // Check defined
  const validParallels = parallels[0];
  const readyParallels = useMemo(() => resArr(validParallels), [validParallels]);
  // Subscribe after fetched structs and keys, too
  useReviewsSubscription(
    api,
    keys ?? [],
    status === 'success' && allCheck(parallels[3], 'success') && !fallback
  );
  // Next, start fetching metadatas.
  // Metas should give enough time for parallel reviews to complete fetching
  const metas = useReviewsWithMetadata(readyParallels, allCheck(parallels[3], 'success'));
  // Same routine for qs
  const vMetaArr = useMemo(() => shouldComputeValid(metas), [metas]);
  const [validMetas, anyMetaErr, anyMetaInitiallyLoading, metaStates] = vMetaArr;
  const readyMetas = useMemo(() => resArr(validMetas), [validMetas]);
  // leave state handling to ui, everyone else should memoise
  return [
    readyMetas,
    anyMetaErr,
    anyMetaInitiallyLoading,
    // UI reacts when metadata available
    allCheck(metaStates, 'idle'),
  ] as [HumanNewReview[], boolean, boolean, boolean];
};
