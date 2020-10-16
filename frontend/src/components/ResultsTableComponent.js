import React from 'react';
import { Icon, Menu, Table } from 'semantic-ui-react'


class ResultsTableComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
			<Table celled selectable size='small'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Spectra ID</Table.HeaderCell>
            <Table.HeaderCell>Predicted species</Table.HeaderCell>
            <Table.HeaderCell>Score</Table.HeaderCell>
            <Table.HeaderCell>Info</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {this.props.job_results.map(d =>
            <Table.Row key={d.spectra_id}>
              <Table.Cell>{d.spectra_id}</Table.Cell>
              <Table.Cell>{d.species}</Table.Cell>
              <Table.Cell>{d.score}</Table.Cell>
              <Table.Cell><Icon name='info circle' /></Table.Cell>
            </Table.Row>
          )}
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='4'>
              {/*
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
              */}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );
  }
}

export default ResultsTableComponent;
