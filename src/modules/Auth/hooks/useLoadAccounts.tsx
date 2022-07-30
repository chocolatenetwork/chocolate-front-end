import { useEffect } from 'react';
import { useAccounts, useSubstrate } from '../../../substrate-lib/SubstrateContext';

export function useLoadAccounts(
  run: boolean,
  setRun: React.Dispatch<React.SetStateAction<boolean>>
): void {
  const { dispatch, loadAccounts } = useAccounts();
  const state = useSubstrate();

  useEffect(() => {
    if (run) {
      // eslint-disable-next-line @typescript-eslint/require-await
      const doRun = () => {
        loadAccounts(state, dispatch);
      };
      doRun();
      return () => setRun(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);
}
