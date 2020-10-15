import React from 'react';
import axios from 'axios';
import { Button, Form, Header, Message } from 'semantic-ui-react'


import history from './history';
import ResultsTableComponent from './components/ResultsTableComponent'


class ResultsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      job_token: '',
      query_value: '',
      job_data: {},
      error_token: false,
      error_token_msg: '',
    };
    //this.pollResults = this.pollResults.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateToken = this.validateToken.bind(this);
    this.prepareResults = this.prepareResults.bind(this);
    this.getResults = this.getResults.bind(this);
    this.handleQueryChange = this.handleQueryChange.bind(this);
  };

  componentDidMount() {
    //this.timer = setInterval(() => this.pollResults(), 30000);
    this.prepareResults();
  }

  componentDidUpdate(prevProps) {
		if (this.props.location !== prevProps.location) {
      this.prepareResults();
    }
  }

  componentWillUnmount() {
  //  clearInterval(this.timer);
  }

  prepareResults() {
    if (this.props.match !== undefined) {
      if (this.validateToken(this.props.match.params.token)) {
        this.getResults(this.props.match.params.token);
      } else {
        this.setState({query_value: this.props.match.params.token});
      }
    } else {
      this.setState({
        job_token: '',
        query_value: ''
      });
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({
      error_token: false,
      error_token_msg: ''
    });
    // Validate and redirect
    if (this.validateToken(this.state.query_value)) {
      history.push(`/results/${this.state.query_value}/`);
    }
  }

  validateToken(job_token) {
    if (job_token == '') {
      this.setState({error_token: true, error_token_msg: 'Token is required'});
      return false
    } else if (! /^[0-9]+$/.test(job_token)) {
      this.setState({error_token: true, error_token_msg: 'Token must be a number'});
      return false
    } else {
      return true
    }
  }

  getResults(job_token) {
    axios.get(`/api/v1/resultsdata/${job_token}/`)
      .then(resp => {
        this.props.addJobData(resp.data),
        this.setState({
          job_data: resp.data,
          job_token: job_token,
          query_value: ''
        })
      })
      .catch(error => {
        if (error.response) {
          if ('token' in error.response.data) {
            this.setState({
              error_token: true,
              error_token_msg: error.response.data['token']
            });
          }
        } else {
          console.log(error)
        }
    });
  }

	handleQueryChange(event) {
    this.setState({query_value: event.target.value});
  };

  render() {
    return (
      <>
        <Header as='h1'>Results</Header>
        <Message
          icon='info circle'
          size='mini'
          header='Enter token to view job results or access existing entries on Jobs page'
          content='Results of incomplete jobs will be automatically updated every 30 seconds.'
        />
        <Form>
          <Form.Input
            label='Job token'
            value={this.state.query_value}
            error={this.state.error_token ?
                {content: this.state.error_token_msg, pointing: 'below'} : false
            }
            onChange={this.handleQueryChange}
            placeholder='Search...'
            action={
              <Button
                primary
                content='Retrieve Results'
                type='button'
                onClick={this.handleSubmit}
              />
            }
          />
        </Form>
        {this.state.job_token &&
          <>
            <Header as='h3'>{this.state.job_data.id} : {this.state.job_data.name}</Header>
            <ResultsTableComponent job_data={this.state.job_data} />
          </>
        }
      </>
    );
  }
}

export default ResultsPage;
