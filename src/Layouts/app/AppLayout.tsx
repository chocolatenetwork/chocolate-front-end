/* eslint-disable import/no-unresolved */
import { AppShell } from '@mantine/core';
import { DeveloperConsole } from 'chocolate/substrate-lib/components';
import { Toaster } from 'react-hot-toast';
import { ReactQueryDevtools } from 'react-query/devtools';
import MenuBar from '../../customComponents/menuBar';
import { loader, message } from '../../customComponents/utilities';
import { useSubstrate } from '../../substrate-lib';
import { AppRoutes } from './components/AppRoutes';
import { InnerAppProvider } from './InnerAppProvider';

/* NB: AppLayout==AppShell, so do  all box styling here */
export function AppLayout(): JSX.Element {
  const substrState = useSubstrate();

  if (substrState.apiState === 'ERROR') return message(substrState.apiError);
  if (substrState.apiState !== 'READY') return loader('Connecting to Substrate');

  return (
    <InnerAppProvider api={substrState.api}>
      <AppShell header={<MenuBar />}>
        <AppRoutes />
        <Toaster position='bottom-right' />
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
        {process.env.NODE_ENV === 'development' && <DeveloperConsole />}
      </AppShell>
    </InnerAppProvider>
  );
  /*  */
}
