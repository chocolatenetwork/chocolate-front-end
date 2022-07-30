import React, { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Button, Dropdown, Icon, Label } from 'semantic-ui-react';
// eslint-disable-next-line import/no-unresolved
import { useApp } from './customComponents/state';
import { useSubstrate } from './substrate-lib';

function Main() {
  const { keyring } = useSubstrate();
  const [accountSelected, setAccountSelected] = useState('');
  const { dispatch } = useApp();
  // Get the list of accounts we possess the private key for
  /** @type {Record<"key" | "value"|"text"|"icon",string>[] | undefined} */
  const keyringOptions =
    keyring?.getPairs().map((account) => ({
      key: account.address,
      value: account.address,
      text: String(account.meta.name).toUpperCase(),
      icon: 'user',
    })) ?? [];

  const [initialAddress, initialName] =
    keyringOptions.length > 0 ? [keyringOptions[0].value, keyringOptions[0].text] : ['', ''];
  // Set the initial address
  useEffect(() => {
    setAccountSelected(initialAddress);
    dispatch({ type: 'USER_DATA', payload: { accountAddress: initialAddress, name: initialName } });
  }, [dispatch, initialAddress, initialName]);

  const onChange = (/** @type {string} */ address) => {
    // Update state with new account address
    setAccountSelected(address);
    // find the userName from existing list
    const userName = keyringOptions.find((thisOpt) => thisOpt.value === address);
    dispatch({ type: 'USER_DATA', payload: { accountAddress: address, name: userName?.text } });
  };

  return (
    <section>
      {!accountSelected ? (
        <span>
          Add your account with the{' '}
          <a
            target='_blank'
            rel='noopener noreferrer'
            href='https://github.com/polkadot-js/extension'
          >
            Polkadot JS Extension
          </a>
        </span>
      ) : null}
      <CopyToClipboard text={accountSelected}>
        <Button basic circular size='large' icon='user' color={accountSelected ? 'green' : 'red'} />
      </CopyToClipboard>
      <Dropdown
        search
        selection
        placeholder='Select an account'
        options={keyringOptions ?? undefined}
        onChange={(_, dropdown) => {
          onChange(String(dropdown.value));
        }}
        value={accountSelected}
      />
      <BalanceAnnotation accountSelected={accountSelected} />
    </section>
  );
}
/**
 *
 * @type {React.FC<{accountSelected?:string;}>}
 * @returns
 */
const BalanceAnnotation = function (props) {
  const { accountSelected } = props;
  const { api } = useSubstrate();
  const [accountBalance, setAccountBalance] = useState('0');

  const { state, dispatch } = useApp();

  // When account address changes, update subscriptions
  useEffect(() => {
    /** @typedef {{():void}} voidFn @type {voidFn} */
    let unsubscribe;
    let /** @type {{():void}}  */ unsubscribe2;

    /** @param {...voidFn} subs */
    function desub(...subs) {
      subs.forEach((unsubable) => {
        unsubable && unsubable();
      });
    }
    // If the user has selected an address, create a new subscription
    if (accountSelected) {
      api &&
        api.query.system
          .account(accountSelected, (balance) => {
            setAccountBalance(balance.data.free.toHuman());
          })
          .then((unsub) => {
            unsubscribe = unsub;
          })
          .catch(() => {});
    }

    // get user rank point data; Include reviews when obtained
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions

    if (accountSelected) {
      api &&
        api.query.usersModule
          .users(accountSelected, (userOpt) => {
            const rank = userOpt.unwrapOrDefault().rankPoints;
            // can't pass structs/objects as props
            dispatch({ type: 'USER_DATA', payload: { rankPoints: rank.toHuman() } });
          })
          .then((unsub) => {
            unsubscribe2 = unsub;
          });
    }

    // unsubscribe from previous
    return () => desub(unsubscribe, unsubscribe2);
  }, [api, accountSelected, dispatch]);

  // display review along with balance. Label doesn't really fit
  return accountSelected ? (
    <>
      <Label pointing='left'>
        <Icon name='money' color='green' />
        {accountBalance}
      </Label>
      <Label pointing='left'>
        <Icon name='point' color='brown' />
        {state.userData.rankPoints}
      </Label>
    </>
  ) : null;
};

/**
 * @param {JSX.IntrinsicAttributes} props
 */
export default function AccountSelector(props) {
  const { keyring } = useSubstrate();
  return keyring && keyring.getPairs ? <Main {...props} /> : null;
}
