import { DispatchError, EventRecord } from '@polkadot/types/interfaces';
import { BN, isJsonObject } from '@polkadot/util';
// eslint-disable-next-line no-use-before-define
import React from 'react';
import { List } from 'semantic-ui-react';

/** this is a faux event view, update this when events are understood better */
const EventView: React.FC<{ event: EventRecord[] }> = function (props) {
  let { event } = props;
  event = event ?? [];
  const view = event.map((record, i) => {
    const { event: localEvent, phase } = record;
    const types = localEvent.typeDef;
    const text = [
      <React.Fragment key={`fragof${localEvent.hash.toString()}${i}`}> </React.Fragment>,
    ]; // Key is mandatory.
    text.push(
      <p key={`${localEvent.hash.toString()}${i}`}>
        {`\t${localEvent.section}.${localEvent.method}::(phase=${phase.defKeys[phase.index]})`}
      </p>
    );
    text.push(
      <p key={JSON.stringify(localEvent.meta)}>{`\t\t${String(localEvent.meta.docs.toHuman())}`}</p>
    );
    // Learn better type parsing this just separates object Object from better human readables.
    localEvent.data.forEach((data, index) => {
      const typeName = types[index].type;
      let enValue = /object Object/.test(String(data.toHuman()))
        ? data.toString()
        : String(data.toHuman());
      // Example type parsing. Generalise to fx that extracts typeName and errName
      if (isJsonObject(enValue)) {
        if (typeName === 'DispatchError') {
          const t = data as unknown as DispatchError;
          if (t.isModule) enValue = t.registry.findMetaError(t.asModule).name;
        }
      }
      text.push(<p key={`${JSON.stringify(types)}${index}`}>{`\t\t\t${typeName}: ${enValue}`}</p>);
    });
    return <List.Item key={`listof${localEvent.hash.toString()}`}>{text}</List.Item>;
  });

  return <List divided>{view}</List>;
};
export { EventView };
/**
 * Assuming all dispatchErrs represent {kind:{error:n, index:n}}, this function strips kind and converts each n to a BN then passes it to registry.findMetaErr of same obj.
 * Awaiting tests for usability with all DispatchErrs
 */
// eslint-disable-next-line
function findAnyMetaErr(t: DispatchError) {
  const metaErr = t.registry.findMetaError(
    // Inner object.entries returns [["ErrName", errObj]].
    // [0] strips to ["ErrName", errObj] , grab errObj with [1].
    Object.entries(Object.entries(t.toJSON())[0][1])
      .map((e) => [e[0], new BN(e[1] as number)] as [string, BN])
      .reduce(
        (prev, curr) => {
          const [f, s] = curr;
          prev[f] = s;
          return prev;
        },
        // Err cond.
        { error: new BN(-1), index: new BN(-1) } as { [x: string]: BN; error: BN; index: BN }
      )
  );
  return metaErr;
}
