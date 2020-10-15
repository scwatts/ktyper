import React from 'react';
import axios from 'axios';
import { Button, Form, Header, Message } from 'semantic-ui-react'


import TokenGridComponent from './components/TokenGridComponent'


class JobsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      job_token: '',
      error_token: false,
      error_token_msg: ''
    };
    this.pollIncompleteJobs = this.pollIncompleteJobs.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.getJob = this.getJob.bind(this);
    this.handleJobTokenChange = this.handleJobTokenChange.bind(this);
  }

  componentDidMount() {
    this.timer = setInterval(() => this.pollIncompleteJobs(), 30000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  pollIncompleteJobs() {
    this.props.job_data.map(d => {
      switch (d.status) {
        case 'initialising':
        case 'queued':
        case 'running':
          axios.get(`/api/v1/jobdata/${d.id}/`)
            .then(resp => {
              this.props.updateJobData(resp.data);
            })
      }
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({
      error_token: false,
      error_token_msg: ''
    });
    // Validate and submit
    if (this.validateForm()) {
      this.getJob(this.state.job_token);
    }
  }

  validateForm() {
    if (this.state.job_token == '') {
      this.setState({error_token: true, error_token_msg: 'Token is required'});
      return false
    } else if (! /^[0-9]+$/.test(this.state.job_token)) {
      this.setState({error_token: true, error_token_msg: 'Token must be a number'});
      return false
    } else {
      return true
    }
  }

  getJob(job_token) {
    axios.get(`/api/v1/jobdata/${job_token}/`)
      .then(resp => {
        this.props.addJobData(resp.data);
        this.setState({job_token: ''});
      })
      .catch(error => {
        if (error.response) {
          if ('token' in error.response.data) {
            this.setState({error_token: true, error_token_msg: error.response.data['token']});
          }
        } else {
          console.log(error)
        }
    });
  }

	handleJobTokenChange(event) {
    this.setState({job_token: event.target.value});
  };

  render() {
    return (
      <>
        <Header as='h1'>Jobs</Header>
        <Message
          icon='info circle'
          size='mini'
          header='Add jobs here by their token to track progress'
          content='Status of all incomplete jobs will be automatically updated every 30 seconds. Click a job entry to view results.'
        />
        <Form>
          <Form.Input
            label='Job token'
            value={this.state.job_token}
            error={this.state.error_token ?
                {content: this.state.error_token_msg, pointing: 'below'} : false
            }
            onChange={this.handleJobTokenChange}
            placeholder='Search...'
            action={
              <Button
                primary
                content='Add Token'
                type='button'
                onClick={this.handleSubmit}
              />
            }
          />
        </Form>
        <TokenGridComponent
          job_data={this.props.job_data}
          removeJobData={this.props.removeJobData}
        />
      </>
    );
  }
}

export default JobsPage;
