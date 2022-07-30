import { ApiPromise } from '@polkadot/api';
import { createContext } from 'react';
import { ProviderComposer } from './components/ProviderComposer';
// Inner contexts
/** Substrate ready:  Forcing api to not be undefined for children */
type SubstrateReady = { api: ApiPromise };
export const SubstrateReadyCTX = createContext<SubstrateReady>({} as SubstrateReady);
type SubstrateReadyProps = React.PropsWithChildren<SubstrateReady>;
function SubstrateReadyContextProvider(props: SubstrateReadyProps) {
  const { api, children } = props;
  return <SubstrateReadyCTX.Provider value={{ api }}>{children}</SubstrateReadyCTX.Provider>;
}

// Provider
type InnerAppProviderProps = SubstrateReadyProps; // Expand props if we add more.
export function InnerAppProvider(props: InnerAppProviderProps): JSX.Element {
  const { api, children } = props;
  return (
    <ProviderComposer contexts={[<SubstrateReadyContextProvider api={api} />]}>
      {children}
    </ProviderComposer>
  );
}
