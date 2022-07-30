import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Image, Label } from 'semantic-ui-react';
import { useSubstrate } from '../../../substrate-lib';
import { HumanNewReview } from '../../../typeSystem/jsonTypes';
import { Rating } from '../../Projects';
// looks good, refactor doesn't edge on this
const ReviewSingle: React.FC<{ each: HumanNewReview }> = function (props) {
  const { each } = props;
  const { content, userID, proposalStatus } = each;
  const substr = useSubstrate();
  const isProposed = () => proposalStatus.status === 'Proposed';
  const accountPair = userID && substr.keyringState === 'READY' && substr.keyring.getPair(userID);
  const name = accountPair ? (accountPair.meta?.name as string | undefined) : 'Anonymous';

  // see: https://github.com/polkadot-js/apps/blob/b957353d225da81e4e4b44835e535d9c389a1255/packages/react-hooks/src/useEventTrigger.ts
  const [readMore, setReadMore] = useState(false);
  const { reviewText, rating } = content;
  const limit = reviewText.length >= 182;
  let rev: React.ReactNode;
  if (limit) {
    rev = (
      <>
        {readMore ? reviewText : `${reviewText.substring(0, 181)}...`}
        <button className='link_button' type='button' onClick={() => setReadMore(!readMore)}>
          {readMore ? 'show less' : '  read more'}
        </button>
      </>
    );
  } else rev = reviewText;
  const src = `https://avatars.dicebear.com/api/identicon/${userID}.svg`;
  return (
    <Card color='purple'>
      <Card.Content>
        {isProposed() && (
          <Label color='yellow' ribbon='right'>
            {proposalStatus.status}
          </Label>
        )}
        <Card.Header>
          <Image src={src} floated='left' rounded size='mini' />
          <Card.Meta as={Link} to={`/user/${userID}`}>
            {name}
          </Card.Meta>
        </Card.Header>
        <Card.Description>{rev}</Card.Description>
      </Card.Content>
      <Card.Content extra floated='right'>
        <Rating rating={rating} fixed />
      </Card.Content>
    </Card>
  );
};
export { ReviewSingle };
