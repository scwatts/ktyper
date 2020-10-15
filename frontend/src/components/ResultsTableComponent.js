import React from 'react';
import { Icon, Menu, Table } from 'semantic-ui-react'


class ResultsTableComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
			<Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Sample name</Table.HeaderCell>
            <Table.HeaderCell>Filename</Table.HeaderCell>
            <Table.HeaderCell>Prediction</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          <Table.Row>
            <Table.Cell>K1</Table.Cell>
            <Table.Cell>50a6969e-44c5-4da0-b2eb-f01a8f632681</Table.Cell>
            <Table.Cell>K. pneumoniae</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>K2</Table.Cell>
            <Table.Cell>368f28bb-04d0-4f71-b905-cf133876a0d0</Table.Cell>
            <Table.Cell>K. variicola</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>K3</Table.Cell>
            <Table.Cell>3deea707-ff0a-4341-95b3-efdf30e41f28</Table.Cell>
            <Table.Cell>K. oxytoca</Table.Cell>
          </Table.Row>
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='3'>
              <Menu floated='right' pagination>
                <Menu.Item as='a' icon>
                  <Icon name='chevron left' />
                </Menu.Item>
                <Menu.Item as='a'>1</Menu.Item>
                <Menu.Item as='a'>2</Menu.Item>
                <Menu.Item as='a'>3</Menu.Item>
                <Menu.Item as='a'>4</Menu.Item>
                <Menu.Item as='a' icon>
                  <Icon name='chevron right' />
                </Menu.Item>
              </Menu>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );
  }
}

export default ResultsTableComponent;
