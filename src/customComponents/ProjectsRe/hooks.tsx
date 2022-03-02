import { Option, StorageKey } from '@polkadot/types';
import { useQuery, UseQueryResult } from 'react-query';
import { ProjectAl, ProjectID } from '../../interfaces';
import { useSubstrate } from '../../substrate-lib';
import { Chocolate, NewMetaData, NewProjectWithIndex } from '../../typeSystem/jsonTypes';
import { errorHandled, toPinataFetch } from '../utils';

/**
 * OwnerID shoould be changed to projectAddress in input
 * @description gets the projects and filters them by not proposed, and adds exta data e.g subscan links and also dispatches state update
 */
const getProjects = async function (
  projects: Promise<[StorageKey<[ProjectID]>, Option<ProjectAl>][] | undefined>
): Promise<NewProjectWithIndex[]> {
  const debug = false;
  if (debug) console.log(projects);
  // projects are properly passed here
  if (!(projects instanceof Promise)) throw new Error('Passed in wrong values');
  const usable = await projects;
  if (debug) console.clear();
  if (debug) console.log(usable);
  const mutatedProjects = usable?.map(async (each) => {
    const [id, project] = each;

    // @ts-expect-error AnyJson is an array type in this case.
    const [[rawId], rawProject] = [id.toHuman(), project.unwrapOrDefault()];
    if (rawProject.isEmpty) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const Id: Chocolate['ProjectID'] = rawId;
    // @ts-expect-error this is te project type returned
    const secondReturnable: Chocolate['Project'] = rawProject.toHuman();
    const [meta, error] = await errorHandled(fetch(toPinataFetch(secondReturnable.metadata)));
    if (error) throw error;
    const realMeta: NewMetaData = (await meta.json()) as NewMetaData;
    realMeta.icon = `https://avatars.dicebear.com/api/initials/${realMeta.name}.svg`;
    const newRet = { ...secondReturnable, metadata: realMeta };
    const ret: NewProjectWithIndex = { Id, project: newRet };
    return ret;
  });
  const mut = await Promise.all(mutatedProjects);
  const cleanProjects = mut.filter((each) => each !== null && each !== undefined);
  return cleanProjects;
};
/** @description  Get all projects as usable jsons and sort by id */
const useProjects = function (): UseQueryResult<NewProjectWithIndex[], unknown> {
  const { api } = useSubstrate();
  // To-do: refactor to useQuery 'chain', 'projects' and useQuery 'ipfs' , 'metadata'
  // then include utility function to consolidate both types. but we good for now. Collects both
  async function fetchProjects() {
    const ret = await getProjects(api.query.chocolateModule.projects.entries());
    ret.sort((pr1, pr2) => {
      let x = 1;
      if (pr1.Id < pr2.Id) x = -1;
      else if (pr1.Id === pr2.Id) x = 0;
      return x;
    });
    return ret;
  }
  return useQuery('projects', fetchProjects);
};
export { useProjects };
