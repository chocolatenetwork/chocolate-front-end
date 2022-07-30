/* eslint-disable import/no-unresolved */
import { LocalStateProvider } from 'chocolate/customComponents/state';
import AuthProvider from 'chocolate/polkadot-apac-hackathon/common/providers/authProvider';
import { SubstrateContextProvider } from 'chocolate/substrate-lib';
import { QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { ProviderComposer } from './components/ProviderComposer';
import { rqClient } from './utils';

type Props = React.PropsWithChildren<Record<string, never | React.ReactNode>>;
function AppProvider(props: Props): JSX.Element {
  const { children } = props;
  return (
    <>
      <ProviderComposer
        contexts={[
          <SubstrateContextProvider />,
          <LocalStateProvider />,
          <QueryClientProvider contextSharing client={rqClient} />,
          <AuthProvider />,
          <BrowserRouter />,
        ]}
      >
        {children}
      </ProviderComposer>
    </>
  );
}

export { AppProvider };
