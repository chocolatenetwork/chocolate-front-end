import './loader.css';

const storageKey = 'ChocAccountType';

const Loading: React.FC<{ message: string; img?: string; greet?: boolean }> = function (
  props
): JSX.Element {
  const { message, img } = props;

  return (
    <article className='load-wrap'>
      <img className='logo' src={img || '#'} alt={`${img && 'chocolate logo'} `} />
      <p className='loader'>{message}</p>
    </article>
  );
};

export { Loading, storageKey };
