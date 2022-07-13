# Substrate Front End Template

This template allows you to create a front-end application that connects to a
[Substrate](https://github.com/paritytech/substrate) node back-end with minimal
configuration. To learn about Substrate itself, visit the
[Substrate Developer Hub](https://substrate.dev).

The template is built with [Create React App](https://github.com/facebook/create-react-app)
and [Polkadot js API](https://polkadot.js.org/api/). Familiarity with these tools
will be helpful, but the template strives to be self-explanatory.

## Using The Template

### Installation

The codebase is installed using [git](https://git-scm.com/) and [yarn](https://yarnpkg.com/). This tutorial assumes you have installed yarn globally prior to installing it within the subdirectories. For the most recent version and how to install yarn, please refer to [yarn](https://yarnpkg.com/) documentation and installation guides.

```bash
# Clone the repository
git clone https://github.com/chocolatenetwork/chocolate-front-end.git
cd chocolate-front-end
yarn install
```

## Usage

You can start the template in development mode to connect to a locally running node

```bash
yarn start
```

You can also build the app in production mode,

```bash
yarn build
```

and open `build/index.html` in your favorite browser.

## Configuration

The template's configuration is stored in the `src/config` directory, with
`common.json` being loaded first, then the environment-specific json file,
and finally environment variables, with precedence.

- `development.json` affects the development environment
- `test.json` affects the test environment, triggered in `yarn test` command.
- `production.json` affects the production environment, triggered in
  `yarn build` command.

Some environment variables are read and integrated in the template `config` object,
including:

- `REACT_APP_PROVIDER_SOCKET` overriding `config[PROVIDER_SOCKET]`
- `REACT_APP_DEVELOPMENT_KEYRING` overriding `config[DEVELOPMENT_KEYRING]`

More on [React environment variables](https://create-react-app.dev/docs/adding-custom-environment-variables).

When writing and deploying your own front end, you should configure:

- Custom types as JSON in `src/config/types.json`. See
  [Extending types](https://polkadot.js.org/api/start/types.extend.html).
- `PROVIDER_SOCKET` in `src/config/production.json` pointing to your own
  deployed node.
- `DEVELOPMENT_KEYRING` in `src/config/common.json` be set to `false`.
  See [Keyring](https://polkadot.js.org/api/start/keyring.html).

## Custom configuration for chocolate:

1. Open the vscode workspace file [here](./chocolateapp.code-workspace). `chocolateapp.code-workspace`, as it groups the main folders in this workspace. Folders of focus are: 

   * [`functions`](./functions/) : This is a nodejs server that handles pinning cids to pinata. Can be run locally with `npm run test` from the folder
   * [`auth-server`](./polkadot-apac-hackathon/auth-server/): This server handles authentication and can be run locally with `npm run start-dev`


Both have `.env.sample` files which will need to be filled with the respective environment variables and copied to a `.env` file in the folder.

> The `functions` folder requires pinata env variables to connect to ipfs, while the `auth-server` uses mongo so a db url would be needed to connect to the database
>
> A better config is comming in https://github.com/chocolatenetwork/chocolate-front-end/tree/development

### Frontend env variables

The frontend needs these environment variables to be set to connect to the node. Note: rpc won't work for local setup because it is overwritten [here](src/App.js#L13). Use a `.env.local` file with this content:

```sh
# You only need provide_playground as that is the default
REACT_APP_PROVIDER_PLAYGROUND="ws://127.0.0.1:9944/"
REACT_APP_PROVIDER_LOCAL="ws://127.0.0.1:9944"
REACT_APP_PROVIDER_PHONE="ws://your.local.net.connected.to.node"
REACT_APP_NODE_CONFIG=true


# Auth server and pin server url overrides
REACT_APP_AUTH_SERVER="http://localhost:3001"
REACT_APP_PIN_SERVER="http://localhost:3000" 
# This is testing sitekey
REACT_APP_CAPTCHA_SITE_KEY="dad203ef-ed62-47f3-965f-baa67b9dbbac"
REACT_APP_DEBUG=false # Enable for verbose logs.

```

### Startup commands Summary:

```sh
# setup
npm install --prefix=functions &
npm install --prefix=polkadot-apac-hackathon/auth-server &
yarn install

# Start frontend
yarn start
# Start auth server
npm run start-dev --prefix=polkadot-apac-hackathon/auth-server
# Start pin server
npm run test --prefix=functions

```

## Gotchas

### Hcaptcha filters out localhost

See: https://docs.hcaptcha.com/#local-development

> The simplest way to circumvent these issues is to add a hosts entry. For example:
>
>`127.0.0.1 test.mydomain.com`
>Place this in `/etc/hosts` on Linux, `/private/etc/hosts` on Mac OS X, or `C:\Windows\System32\Drivers\etc\hosts` on Windows.
>
>You can then access your local server via http://test.mydomain.com, and everything will work as expected.

### Cors error when using test host

Cors is only configured for the `auth-server` and you can change config [here](./polkadot-apac-hackathon/auth-server/app.ts#L26)

### Specifying Connecting Node

There are two ways to specify it:

- With `PROVIDER_SOCKET` in `{common, development, production}.json`.
- With `rpc=<ws or wss connection>` query paramter after the URL. This overrides the above setting.

## Reusable Components

### useSubstrate Custom Hook

The custom hook `useSubstrate` provides access to the Polkadot js API and thus the
keyring and the blockchain itself. Specifically it exposes this API.

```js
{
  socket,
  types,
  keyring,
  keyringState,
  api,
  apiState,
}
```

- `socket` - The remote provider socket it is connecting to.
- `types` - The custom types used in the connected node.
- `keyring` - A keyring of accounts available to the user.
- `keyringState` - One of `"READY"` or `"ERROR"` states. `keyring` is valid
  only when `keyringState === "READY"`.
- `api` - The remote api to the connected node.
- `apiState` - One of `"CONNECTING"`, `"READY"`, or `"ERROR"` states. `api` is valid
  only when `apiState === "READY"`.

### TxButton Component

The [TxButton](./src/substrate-lib/components/TxButton.js) handles basic
[query](https://polkadot.js.org/api/start/api.query.html) and
[transaction](https://polkadot.js.org/api/start/api.tx.html) requests to the
connected node. You can reuse this component for a wide variety of queries and
transactions. See [src/Transfer.js](./src/Transfer.js) for a transaction example
and [src/ChainState.js](./src/ChainState.js) for a query example.

### Account Selector

The [Account Selector](./src/AccountSelector.js) provides the user with a unified way to
select their account from a keyring. If the Balances module is installed in the runtime,
it also displays the user's token balance. It is included in the template already.
