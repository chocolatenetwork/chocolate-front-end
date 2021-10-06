import React, { useReducer, useContext } from 'react';
import PropTypes from 'prop-types';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import queryString from 'query-string';
// doc imports
import {DefinitionRpcExt,AnyJson} from '@polkadot/types/types'
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import keyring from '@polkadot/ui-keyring';

import config from '../config';

const parsedQuery = queryString.parse(window.location.search);
const connectedSocket = parsedQuery.rpc || config.PROVIDER_SOCKET;
console.log(`Connected socket: ${connectedSocket}`);

///
// Initial state for `useReducer`
/**
 * @typedef {{[x:string]:any;
 *  socket: typeof connectedSocket;
 *  jsonrpc: typeof jsonrpc & typeof config["RPC"];
 * types: typeof config["types"];
 * keyring: null;
 * keyringState:null;
 * api:null;
 * apiError:null;
 * apiState:null;
 * }} INIT
 * @type {INIT}
 */
const INIT_STATE = {
  socket: connectedSocket,
  /** 
   * @type {typeof jsonrpc & config["RPC"]} 
   */
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
 * @typedef {{
 *    [x: string]:any;
 *    socket: INIT["socket"];
 *    jsonrpc:INIT["jsonrpc"]; types: INIT["types"];
 *    keyring:null | typeof keyring;
 *    keyringState:null | 'LOADING' | "ERROR" | "READY";
 *    api:null | ApiPromise;
 *    apiState:null | "CONNECT_INIT" | "CONNECTING" | "READY" | "ERROR"; 
 *    apiError: AnyJson;
 *  }} SubstrState
 * @typedef {{ type: "CONNECT_INIT" | "CONNECT_SUCCESS" | "LOAD_KEYRING" |"KEYRING_ERROR" ;} | 
 * {type: "CONNECT"; payload: ApiPromise;}| {type:"CONNECT_ERROR"; payload:any;} |
 * {type:"SET_KEYRING";payload:typeof keyring} | {type:"other";payload:any;}} action 
 * @type {React.Reducer<SubstrState,action>}
 * 
 * @returns {SubstrState}
 */
const reducer = (state,action) => {
  switch (action.type) {
    case 'CONNECT_INIT':
      return { ...state, apiState: 'CONNECT_INIT' };

    case 'CONNECT':
      return { ...state, api: action.payload, apiState: 'CONNECTING' };

    case 'CONNECT_SUCCESS':
      return { ...state, apiState: 'READY' };

    case 'CONNECT_ERROR':
      return { ...state, apiState: 'ERROR', apiError: action.payload };

    case 'LOAD_KEYRING':
      return { ...state, keyringState: 'LOADING' };

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
    _api.isReady.then((_api) => dispatch({ type: 'CONNECT_SUCCESS' }));
  });
  _api.on('ready', () => dispatch({ type: 'CONNECT_SUCCESS' }));
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

/** 
 *  ** RENDER BEFORE USING SUBSTRATECONTEXT **
 *  @description At a glance this is a top-level provider for only the context, but it also allows for definition of types and a socket that overrides those preset in config, all from app.js
 *  @type {React.FC<{[x:string]: any;socket?:string; types?:{[x:string]:any};}>}*/
const SubstrateContextProvider = (props) => {
  // filtering props and merge with default param value
  const initState = { ...INIT_STATE };
  const neededPropNames = ['socket', 'types'];
  neededPropNames.forEach(key => {
    initState[key] = (typeof props[key] === 'undefined' ? initState[key] : props[key]);
  });

  const [state, dispatch] = useReducer(reducer, initState);
  connect(state, dispatch);
  loadAccounts(state, dispatch);

  return <SubstrateContext.Provider value={state}>
    {props.children}
  </SubstrateContext.Provider>;
};

// prop typechecking
SubstrateContextProvider.propTypes = {
  socket: PropTypes.string,
  types: PropTypes.object
};

const useSubstrate = () => ({ ...useContext(SubstrateContext) });

export { SubstrateContextProvider, useSubstrate };
