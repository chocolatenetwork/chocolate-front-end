/* eslint-disable import/no-unresolved */
import { useSubstrate } from 'chocolate/substrate-lib';
import { JSONUser } from 'chocolate/typeSystem/jsonTypes';
/* eslint-enable import/no-unresolved */
import { useEffect, useState } from 'react';
import { Button, Card, Container, Image, Label } from 'semantic-ui-react';
import { useUserReviews } from '../common/hooks/useUserReviews';

interface SidebarProps {
  user: JSONUser;
  web3Addr: string;
}

const SideBarStat: React.FC<{
  content: string;
  stat: string;
}> = ({ content, stat }) => (
  <div
    style={{
      padding: '5px',
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'space-between',
    }}
  >
    <span>{content}</span>
    <span>{stat}</span>
  </div>
);

const Sidebar: React.FC<SidebarProps> = (props) => {
  const { user, web3Addr } = props;
  const [userAggr, setUserAggr] = useState({ name: 'Anonymous' });
  // try to grab user from keyring
  const web3Address = web3Addr;
  const search = useUserReviews(web3Address);

  const { keyring } = useSubstrate();
  useEffect(() => {
    if (keyring) {
      const userAccount = keyring.getPair(web3Address);
      if (userAccount.meta && userAccount.meta.name)
        setUserAggr({ name: userAccount.meta.name as string });
    }
  }, [keyring, web3Address]);

  return (
    <Container fluid>
      <Card fluid>
        <Card.Content textAlign='center'>
          <Image centered src='https://picsum.photos/200 ' size='small' circular />
        </Card.Content>
        <Card.Content>
          <Card.Header textAlign='center'>{userAggr.name}</Card.Header>
          {/* get from server  - when joined */}

          <Card>
            <Card.Content>
              <Label color='purple' ribbon='right'>
                {/* assuming we store this meta on chain */}
                {userAggr.name !== 'Anonymous' ? 'Joined' : 'Not Joined'}
              </Label>
              {/* Make stats available via easier means e.g store onchain or in other metadata */}
              <SideBarStat content='No. of Reviews' stat={search[0].length.toString()} />
              <SideBarStat content='Points' stat={user.rankPoints?.toString() ?? '0'} />
            </Card.Content>
          </Card>
        </Card.Content>
        <Card.Content textAlign='center'>
          <Button
            size='big'
            compact
            href={`https://twitter.com/${userAggr.name}`}
            icon='twitter square'
          />
          <Button compact size='big' href={`https://discord.com/${userAggr.name}`} icon='discord' />
        </Card.Content>
      </Card>
    </Container>
  );
};
export default Sidebar;
