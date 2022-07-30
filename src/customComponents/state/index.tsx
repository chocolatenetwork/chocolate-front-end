import { createContext, useContext, useReducer } from 'react';
import { ReviewAl, User } from '../../interfaces';

const INIT_STATE: {
  userData: {
    name: string;
    accountAddress: string;
    rankPoints: User['rankPoints'] | 0 | string;
    userReviews: [ReviewAl?];
    accountType: '' | 'unset' | 'user' | 'project';
  };
} = {
  userData: {
    name: '',
    accountAddress: '',
    rankPoints: 0,
    userReviews: [],
    accountType: '',
  },
};

interface AppState {
  userData: typeof INIT_STATE['userData'];
}
interface ActionType {
  type: 'USER_DATA';
  payload: Partial<typeof INIT_STATE['userData']>;
}
function reducer(
  state: AppState,
  action: ActionType
): ReturnType<React.Reducer<AppState, ActionType>> {
  //  mutate the state with action, not directly
  const { payload, type } = action;
  switch (type) {
    case 'USER_DATA':
      // arbitrarily override top-level fields - Update data
      return { ...state, userData: { ...state.userData, ...payload } };
    default:
      throw new Error('no matching action type');
  }
}

interface AppCTX {
  state: AppState;
  dispatch: React.Dispatch<ActionType>;
}
// @ts-expect-error Typing createContext is tedious in js. _ Move to ts then!
const AppContext: React.Context<AppCTX> = createContext();

const LocalStateProvider: React.FC = (props) => {
  // filtering props and merge with default param value
  const initState = { ...INIT_STATE };
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initState);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

function useApp(): AppCTX {
  return { ...useContext(AppContext) };
}

export { useApp, LocalStateProvider };
