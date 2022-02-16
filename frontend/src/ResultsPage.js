import React from 'react';
import axios from 'axios';
import { Button, Form, Header, Icon, Message, Segment } from 'semantic-ui-react';


import history from './history';
import './ResultsPage.css';
import ResultsTableComponent from './components/ResultsTableComponent';


class ResultsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      job_token: '',
      query_value: '',
      job_data: [],
      job_results: {},
      error_token: false,
      error_token_msg: '',
    };
    this.pollResults = this.pollResults.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateToken = this.validateToken.bind(this);
    this.prepareResults = this.prepareResults.bind(this);
    this.getJobResults = this.getJobResults.bind(this);
    this.getJobData = this.getJobData.bind(this);
    this.handlePurge = this.handlePurge.bind(this);
    this.handleQueryChange = this.handleQueryChange.bind(this);
  };

  componentDidMount() {
    this.timer = setInterval(() => this.pollResults(), 1000);
    this.prepareResults();
  }

  componentDidUpdate(prevProps) {
    if (this.state.job_data.status == "completed" || this.state.job_data.status == "failed")
        clearInterval(this.timer);
    if (this.props.location !== prevProps.location) {
      this.prepareResults();
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  pollResults () {
    // NOTE: this is a little wasteful; conditionally retrieve job_results once
    // status is complete would be better
    if (this.state.job_data.status != 'completed' && this.state.job_data.uuid) {
      if (this.validateToken(this.state.job_data.uuid)) {
        this.getJobData(this.state.job_data.uuid);
        this.getJobResults(this.state.job_data.uuid);
      }
    }
  }

  prepareResults() {
    if (this.props.match !== undefined) {
      if (this.validateToken(this.props.match.params.token)) {
        this.getJobResults(this.props.match.params.token);
        this.getJobData(this.props.match.params.token);
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
    } else if (! /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(job_token)) {
      this.setState({error_token: true, error_token_msg: 'Token must be a UUID'});
      return false
    } else {
      return true
    }
  }

  getJobResults(job_token) {
    axios.get(`/api/v1/resultdata/${job_token}/`)
      .then(resp => {
        this.setState({
          job_results: resp.data['results'],
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

  handlePurge(event) {
    const uuid=this.state.job_token;
    axios.post(`/api/v1/deletejob/${uuid}/`, {})
      .then(resp => {
        this.props.removeJobData(uuid);
        this.props.history.push('/jobs');
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

  getJobData(job_token) {
    axios.get(`/api/v1/jobdata/${job_token}/`)
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
            this.props.removeJobData(job_token);
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
    const header = (
      <>
        <Header as='h1'>Results</Header>
        <Message
          icon='info circle'
          size='mini'
          header='Enter token to view job results or access existing entries on Jobs page'
          content='Results of incomplete jobs will be automatically updated every second.'
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
      </>
    );

    if (this.state.job_token == '') {
      return (
        <>
          {header}
        </>
      );
    }

    return (
      <>
        {header}
        {this.state.job_token &&
          <>
            <Header as='h3' id='result_table_header'>{this.state.job_data.name}</Header>
            <Header.Subheader id='result_table_subheader'>{this.state.job_data.uuid}</Header.Subheader>
            <Button
              id='result_download_button'
              disabled={this.state.job_results.length <= 0  || this.state.job_data.status !== 'completed'}
              href={`/api/v1/downloadresult/${this.state.job_token}/`}
              color='blue'
            >
              Download
            </Button>
            <Button
              disabled={this.state.job_results.length <= 0  || this.state.job_data.status !== 'completed'}
              content=' Purge from server'
              onClick={this.handlePurge}
              color='red'
            />
          </>
        }
        {this.state.job_results.length > 0  && this.state.job_data.status == 'completed' ?
              <ResultsTableComponent job_results={this.state.job_results} />
            :
              <>
                <Segment placeholder>
                  <Header icon>
                    {renderJobStatusIcon(this.state.job_data.status)}
                    {renderJobStatusText(this.state.job_data.status)}
                  </Header>
                </Segment>
              </>
        }
      </>
    );
  }
}


// TODO: reused from ResultsPage.js, cleanup
function renderJobStatusIcon(job_status) {
  switch(job_status) {
    case 'initialising':
      return <Icon loading name='circle notch' />;
    case 'queued':
      return <Icon name='boxes' />;
    case 'running':
      return <Icon loading name='cog' />;
    case 'completed':
      return <Icon name='check circle outline' color='green' />;
    case 'failed':
      return <Icon name='exclamation circle' color='red' />;
    default:
      return <Icon name='question circle outline' />;
  }
}


function renderJobStatusText(job_status) {
  if (job_status === 'failed') {
    return 'Job failed'
  } else {
    return `Job is ${job_status}`
  }
}


export default ResultsPage;
