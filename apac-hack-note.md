# Apac Hack note

The code in this repository picks up from the progress done during the encode hack submission of this project.
i.e All work stemming from this [commit](https://github.com/chocolatenetwork/apac-ui/commit/492089a45fd9f682d10c3b9168387aa17f5e063c)

During the apac hackathon, the following improvements were made to our platform:

1. Inclusion of an auth system - username and password
2. User profiles and a gallery page of the projects

These have been organised into respective polkadot-apac-hackathon folders.

1. [Auth-server](./polkadot-apac-hackathon/README.md)
2. [Auth-view](./src/polkadot-apac-hackathon/README.md)
## UI Setup

This has been moved to [substrate-template](./substrate-template.md)

# Implementor's guide.

The goals are split into the following sections:

1. Route protection for stage 2 and above in review modal - require auth.
2. Include user profile route based on web3 address as pulled from chain.
3. Include the gallery page.
4. Complete signup form that collects name, web3 address and, _optionally_, password
5. Setup react router for the login to redirect to last page
6. Complete `useAuthState` hook to check with server and implement further guards for [jwt auth](https://www.youtube.com/watch?v=iD49_NIQ-R4).
7. Develop multicurrency selector for collateralisation and use in a stage of the submit review modal- requires types from chain.
8. Add in hcaptcha component for forms _optional_, ref could be made to flips instead.
9. setup docs detailing the distinct feature added and code separation for moderators

Reference [server-guide](./auth-server/README.md#%20Implementor's%20guide.) for more info, or lmk.

# Notes on implemented parts

Only goals 1, 2, 4, 5,6,8 and 9 were achieved for this hackathon.

## Further resources

1. [Manual_routing](https://github.com/remix-run/react-router/tree/main/examples/auth)
2. [server redirects](https://stackoverflow.com/a/43213567/16071410).

## Further notes

- Route protection can be obtained by doing auth check before switch statement and not in individual components. The hook itself can be polyfilled on the client while the actual endpoint is being developed on server
- Each review object coming from the chain has the `ownerId` as the public key of the writer, hence this address serves as a good id for the respective profiles. Since the key is stored on the db, further metadata can be pulled.
- For user profile, the components with styling are ready [here](https://github.com/tobechi00/jade) **Note:** doen't show review on click yet , all's left is to wire it up with the respective data and fill-in metadata with db on the server

- Rerouting for login and signup can make use of [react-router]'s `useNavigate` hook to retain memory of last route before login/signup

- for access to substrate rpc calls, the api promise interface is used with methods mapping each section - `queries`, `extrinsics` and the like.Provided by the [`useSubstrate`] hook from the [`substrateProvider`]. Further notes on api [here](./substrate-template.md#%20useSubstrate%20Custom%20Hook)

Note: TxButton is a useful interface currently used to handle calls to `api.tx`

## Security notes.

As listed out by the hasura tutorial, owasp provides a concrete way of preventing xss after the prereq of csrf protection that jwts and refresh tokens provide.

One such is disallowing any untrusted data injection.

1. An example is react router route params
