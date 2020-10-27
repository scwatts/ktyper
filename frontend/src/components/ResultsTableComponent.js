import React from 'react';
import { Dropdown, Icon, Pagination, Table } from 'semantic-ui-react'


import './ResultsTableComponent.css'


class ResultsTableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      species_filter: [],
      results_filtered: this.props.job_results,

      sort_column: '',
      sort_direction: 'descending',

      active_page: 1,
    };
    this.speciesDropDown = this.speciesDropDown.bind(this);
    this.handleDropDownChange = this.handleDropDownChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
  }

  speciesDropDown() {
    const species = [...new Set(this.props.job_results.map(d => d.species))];
    return species.map(s => { return {key: s, value: s, text: s}});
  }

  // TODO: resort on change
  // TODO: consider set active_page to default on change - I think this is desired
  handleDropDownChange(event, result) {
    this.setState({
      species_filter: result.value,
      results_filtered: this.props.job_results.filter(d =>
        result.value.length == 0 || result.value.includes(d.species)
      )
    });
  }

  handleSortChange(name) {
    const sort_direction = this.state.sort_direction === 'ascending' ? 'descending' : 'ascending';
    var results_sorted;
    if (sort_direction === 'ascending') {
      results_sorted = this.state.results_filtered.slice().sort((a, b) => a[name] > b[name])
    } else if (sort_direction === 'descending') {
      results_sorted = this.state.results_filtered.slice().sort((a, b) => a[name] <= b[name])
    }
    this.setState({
      sort_column: name,
      sort_direction: sort_direction,
      results_filtered: results_sorted,
    });
  }

  handlePageChange(event, result) {
    this.setState({active_page: result.activePage});
  }

  getResultPage() {
    const start = (this.state.active_page - 1) * 10;
    const end = this.state.active_page * 10;
    return this.state.results_filtered.slice(start, end);
  }

  // TODO: check this if this is needed
  /*
  componentDidUpdate(prevProps) {
		if (this.props.job_results !== prevProps.job_results) {
      this.setState({
        results_filtered: this.props.job_results.filter(d =>
          this.state.result.value.length == 0 || this.state.result.value.includes(d.species)
        )
      });
    }
  }
  */

  render() {
    return (
      <>
        <Dropdown
          id='species_dropdown'
          placeholder='Species filter'
          fluid
          multiple
          search
          selection
          options={this.speciesDropDown()}
          onChange={this.handleDropDownChange}
        />
        <Table celled sortable selectable size='small'>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                sorted={this.state.sort_column==='spectra_id' ? this.state.sort_direction : null}
                onClick={() => this.handleSortChange('spectra_id')}
              >
                Spectra ID
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={this.state.sort_column==='species' ? this.state.sort_direction : null}
                onClick={() => this.handleSortChange('species')}
              >
                Predicted species
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={this.state.sort_column==='score' ? this.state.sort_direction : null}
                onClick={() => this.handleSortChange('score')}
              >
                Score
              </Table.HeaderCell>
              <Table.HeaderCell
              >
                Info
            </Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {this.getResultPage().map(d =>
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
                <Pagination
                  defaultActivePage={1}
                  totalPages={Math.ceil(this.state.results_filtered.length / 10)}
                  onPageChange={this.handlePageChange}
                />
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </>
    );
  }
}

export default ResultsTableComponent;
