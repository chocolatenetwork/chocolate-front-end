import config from '../../config';
import { errorHandled } from '../../customComponents/utils';

export interface LogoutResult {
  success: boolean;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export async function LOGOUT_MUTATION(): Promise<LogoutResult> {
  const res = await errorHandled(
    fetch(`${config.REACT_APP_AUTH_SERVER}/logout`, { method: 'POST', credentials: 'include' })
  );
  if (res[1]) throw res[1];
  const json = await errorHandled<LogoutResult>(res[0].json());
  if (json[1]) throw json[1];
  return json[0];
}
