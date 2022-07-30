import { cloneElement } from 'react';
// Composer component
type Props = React.PropsWithChildren<{
  contexts: React.ReactElement[];
}>;

export function ProviderComposer({ contexts, children }: Props): JSX.Element {
  return (
    <>
      {contexts.reduceRight(
        (kids, parent) =>
          cloneElement(parent, {
            children: kids,
          }),
        children
      )}
    </>
  );
}
