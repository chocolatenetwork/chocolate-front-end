import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import keyring from '@polkadot/ui-keyring';
import PropTypes from 'prop-types';
import React, { useContext, useReducer } from 'react';
import config from '../config';


const parsedQuery = new URLSearchParams(window.location.search);
const connectedSocket = parsedQuery.get('rpc') || config.PROVIDER_SOCKET;
console.log(`Connected socket: ${connectedSocket}`);

///
// Initial state for `useReducer`
/**
 * @typedef {import('./SubstrateCTXTypes').INIT} INIT
 * @type {INIT}
 */
const INIT_STATE = {
  socket: connectedSocket,
  jsonrpc: { ...jsonrpc, ...config.RPC },
  types: config.types,
  keyring: null,
  keyringState: null,
  api: null,
  apiError: null,
  apiState: null
};

///
// Reducer function for `useReducer`

/**
 * @typedef  { import('./SubstrateCTXTypes').SubstrState} SubstrState 
 * @typedef {{ type: "CONNECT_INIT" | "LOAD_KEYRING" |"KEYRING_ERROR" ;} | 
 * {type: "CONNECT"; payload: ApiPromise;}| {type:"CONNECT_ERROR"; payload:import('@polkadot/types/types').AnyJson;} |
 * {type:"SET_KEYRING";payload:typeof keyring} | {type: "CONNECT_SUCCESS"; payload: ApiPromise}|  {type:"other";}} action 
 * @type {React.Reducer<SubstrState,action>}
 * 
 * @returns {SubstrState}
 */
const reducer = (state,action) => {
  switch (action.type) {
    case 'CONNECT_INIT':
      return { ...state,api: null, apiState: 'CONNECT_INIT' };

    case 'CONNECT':
      return { ...state, api: action.payload, apiState: 'CONNECTING' };

    case 'CONNECT_SUCCESS':
      return { ...state, api: action.payload, apiState: 'READY' };

    case 'CONNECT_ERROR':
      return { ...state,api: null, apiState: 'ERROR', apiError: action.payload };

    case 'LOAD_KEYRING':
      return { ...state,keyring: null, keyringState: 'LOADING' };

    case 'SET_KEYRING':
      return { ...state, keyring: action.payload, keyringState: 'READY' };

    case 'KEYRING_ERROR':
      return { ...state, keyring: null, keyringState: 'ERROR' };

    default:
      throw new Error(`Unknown type: ${action.type}`);
  }
};

///
// Connecting to the Substrate node
/**
 *  Connecting to the Substrate node
 *  @param {SubstrState} state
 *  @typedef {{ (value: action): void;}} overload_dispatch
 *  @param {overload_dispatch} dispatch
 * 
*/
const connect = (state, dispatch) => {
  const { apiState, socket, jsonrpc, types } = state;
  // We only want this function to be performed once
  if (apiState) return;

  dispatch({ type: 'CONNECT_INIT' });

  const provider = new WsProvider(socket);
  const _api = new ApiPromise({ provider, types, rpc: jsonrpc });

  // Set listeners for disconnection and reconnection event.
  _api.on('connected', () => {
    dispatch({ type: 'CONNECT', payload: _api });
    // `ready` event is not emitted upon reconnection and is checked explicitly here.
    _api.isReady.then((__api) => dispatch({ type: 'CONNECT_SUCCESS', payload: __api }));
  });
  _api.on('ready', () => dispatch({ type: 'CONNECT_SUCCESS', payload: _api }));
  _api.on('error', err => dispatch({ type: 'CONNECT_ERROR', payload: err }));
};

///
// Loading accounts from dev and polkadot-js extension

let loadAccts = false;
/**
 *  Loading accounts from dev and polkadot-js extension.  
 *  Async, closes upon loadAccts bool for state management.
 *  @param {SubstrState} state
 *  @param {overload_dispatch} dispatch
 * 
*/
const loadAccounts = (state, dispatch) => {
  const asyncLoadAccounts = async () => {
    dispatch({ type: 'LOAD_KEYRING' });
    try {
      await web3Enable(config.APP_NAME);
      let allAccounts = await web3Accounts();
      allAccounts = allAccounts.map(({ address, meta }) =>
        ({ address, meta: { ...meta, name: `${meta.name} (${meta.source})` } }));
      keyring.loadAll({ isDevelopment: config.DEVELOPMENT_KEYRING }, allAccounts);
      dispatch({ type: 'SET_KEYRING', payload: keyring });
    } catch (e) {
      console.error(e);
      dispatch({ type: 'KEYRING_ERROR' });
    }
  };

  const { keyringState } = state;
  // If `keyringState` is not null `asyncLoadAccounts` is running.
  if (keyringState) return;
  // If `loadAccts` is true, the `asyncLoadAccounts` has been run once.
  if (loadAccts) return dispatch({ type: 'SET_KEYRING', payload: keyring });

  // This is the heavy duty work
  loadAccts = true;
  asyncLoadAccounts();
};


/** This is a necessary evil as we need to have a value for the context.
 * @type {React.Context<SubstrState>} */
// @ts-expect-error
const SubstrateContext = React.createContext();
/** @type {React.Context<{dispatch:React.Dispatch<action>;loadAccounts: typeof loadAccounts}>} */
const DispatchContext = React.createContext(Object());
/** 
 *  ** RENDER BEFORE USING SUBSTRATECONTEXT **
 *  @description At a glance this is a top-level provider for only the context, but it also allows for definition of types and a socket that overrides those preset in config, all from app.js
 *  @type {React.FC<{socket?:string; types?:Partial<INIT['types']>;}>}*/
const SubstrateContextProvider = (props) => {
  // filtering props and merge with default param value
  let initState = { ...INIT_STATE };
  /** @type {['socket','types']} */
  const neededPropNames = ['socket', 'types'];
  neededPropNames.forEach(key => {
    const prop  = props[key];
    if(typeof prop !== 'undefined'){
      initState = Object.assign({},initState,{[key]: prop});
    }
  });

  const [state, dispatch] = useReducer(reducer, initState);
  connect(state, dispatch);
  // loadAccounts(state, dispatch);


  return <DispatchContext.Provider value={{dispatch,loadAccounts}}>
          <SubstrateContext.Provider value={state}>
            {props.children}
          </SubstrateContext.Provider>
        </DispatchContext.Provider>

};

// prop typechecking
SubstrateContextProvider.propTypes = {
  socket: PropTypes.string,
  types: PropTypes.object
};

const useSubstrate = () => ({ ...useContext(SubstrateContext) });
const useAccounts = ()=> ({...useContext(DispatchContext)})
export { SubstrateContextProvider, useSubstrate, useAccounts };
