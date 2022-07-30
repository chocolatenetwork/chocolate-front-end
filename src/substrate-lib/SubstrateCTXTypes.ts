import { ApiPromise } from "@polkadot/api";
import jsonrpc from "@polkadot/types/interfaces/jsonrpc";
import { AnyJson } from "@polkadot/types/types";
import keyring from "@polkadot/ui-keyring";
import config from "../config";

// Api and keyring states
/**
 * Api States:
 *  * "CONNECT_INIT":  Could enter this from an errored state or init state, and in both cases the api is null.
 *  * "ERROR" : api is null, unavailable.
 *  * "CONNECTING": api object is available, but establishing connection
 *  * "READY": api object is available and connection has been established.
 * Keyring states:
 *  * 'LOADING':  Keyring is being loaded, keyring is null in both entry points (Error and Init)
 *  * "ERROR": Keyring is null, error happened
 *  * "READY": Keyring is available.
 */
//  Base values that the object adheres to
interface SubstrStateBase {
  socket: string;
  jsonrpc: typeof jsonrpc & typeof config["RPC"];
  types: typeof config["types"];
}
// Either both null (INIT or both err)
interface SubstrInitAllNull extends SubstrStateBase {
  keyring: null;
  keyringState: null | "LOADING" | "ERROR";
  api: null;
  apiState: null | "ERROR" | "CONNECT_INIT";
  apiError: AnyJson;
}
export type INIT = SubstrInitAllNull;

// Or api is loaded and keyring isn't e.g keyring errors or delayed start
interface ApiLoaded extends SubstrStateBase {
  keyring: null;
  keyringState: null | "LOADING" | "ERROR";
  api: ApiPromise;
  apiState: "CONNECTING" | "READY";
  apiError: AnyJson;
}
// Or keyring is loaded and api isn't e.g Api Errors
interface KeyringLoaded extends SubstrStateBase {
  keyring: typeof keyring;
  keyringState: "READY";
  api: null;
  apiState: null | "ERROR" | "CONNECT_INIT";
  apiError: AnyJson;
}
// Or both are loaded
interface BothLoaded extends SubstrStateBase {
  keyring: typeof keyring;
  keyringState: "READY";
  api: ApiPromise;
  apiState: "CONNECTING" | "READY";
  apiError: AnyJson;
}

export type SubstrState =
  | SubstrInitAllNull
  | ApiLoaded
  | KeyringLoaded
  | BothLoaded;
