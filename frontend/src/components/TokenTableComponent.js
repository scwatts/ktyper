import React from 'react';
import { Table, Button, Header, Icon, Segment, Transition } from 'semantic-ui-react'


import './TokenTableComponent.css'


function TokenTableComponent(props) {
  if (props.job_tokens.length == 0) {
    return (
      <Segment placeholder>
        <Header icon>
          <Icon name='search' />
          No tokens found in local browser storage
        </Header>
      </Segment>
    );
  } else {
    return (
      <Table basic='very' celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Token</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Transition.Group
          as={Table.Body}
          duration={200}
          animation='fly down'
        >
          {props.job_tokens.slice().reverse().map(token =>
            <Table.Row key={token}>
              <Table.Cell>
                <Header as='h4' image>
                  <Icon name='github' />
                  <Header.Content>
                    {token}
                    <Header.Subheader>Submitted 10 mins ago</Header.Subheader>
                  </Header.Content>
                </Header>
              </Table.Cell>
              <Table.Cell textAlign='center'>
                <Button color='red'>
                  <Icon name='trash alternate outline' size='large' />
                </Button>
              </Table.Cell>
            </Table.Row>
          )}
        </Transition.Group>
      </Table>
    );
  }
}

export default TokenTableComponent;
