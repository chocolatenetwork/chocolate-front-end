// eslint-disable-next-line no-use-before-define
import React, { useEffect, useRef, useState } from 'react';
import { HumanNewProjectWithIndex } from '../../../typeSystem/jsonTypes';
import { calcResults, handleSubmit } from '../majorUtils';
import { DisplayResults } from './DisplayResults';

type TimeoutId = ReturnType<typeof setTimeout>;
function SearchBar(
  props: React.PropsWithChildren<{ projects: HumanNewProjectWithIndex[] }>
): JSX.Element {
  // data state is handled externally
  const { projects } = props;
  const [value, setValue] = useState('');
  const [found, setFound] = useState(false);
  const [results, setResults] = useState<HumanNewProjectWithIndex[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const blurTimeoutRef = useRef<TimeoutId>();
  const searchTimeoutRef = useRef<TimeoutId>();
  useEffect(
    () => () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    },
    []
  );
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      clearTimeout(searchTimeoutRef.current);
      const localValue = e.target.value;
      setValue(localValue);
      if (localValue.length > 0) {
        searchTimeoutRef.current = setTimeout(() => {
          if (!isSearching) setIsSearching(true);
          const [searchResults, isFound] = calcResults(projects, localValue);
          setFound(isFound);
          setResults(searchResults);
        }, 300);
      } else {
        setFound(false);
        setIsSearching(false);
        setResults([]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, projects]
  );
  function blurHandler() {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    blurTimeoutRef.current = setTimeout(() => {
      setIsSearching(false);
    }, 500);
  }
  function focusHandler() {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
  }
  return (
    <form
      role='search'
      className='ui search'
      onBlur={blurHandler}
      onFocus={focusHandler}
      onSubmit={handleSubmit}
    >
      <div className='searchbar'>
        <input
          className='searchbar__input'
          type='search'
          placeholder='Search for a project'
          aria-label='Search for a project'
          value={value}
          onChange={handleChange}
        />
      </div>
      {isSearching && <DisplayResults data={results} found={found} />}
    </form>
  );
}
export { SearchBar };
