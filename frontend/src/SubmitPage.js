import React from 'react';
import axios from 'axios';
import { Button, Form, Header, Message, Progress, Transition } from 'semantic-ui-react'


import SubmitModal from './components/SubmitModal'


class SubmitPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      filename: '',
      file: '',
      processing: false,
      uploading: false,
      upload_complete: false,
      progress: 0,
      token: '',

      error_name: false,
      error_file: false,
      error_name_msg: '',
      error_file_msg: '',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.postJob = this.postJob.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.updateUploadProgress = this.updateUploadProgress.bind(this);
  };

  fileInputRef = React.createRef();

  updateUploadProgress(event) {
    const progress = Math.round((event.loaded * 100) / event.total);
    this.setState({progress: progress, uploading: true});
  };

	handleNameChange(event) {
    this.setState({name: event.target.value});
  };

	handleFileChange(event) {
    this.setState({
      filename: event.target.files[0].name,
      file: event.target.files[0]
    });
  };

  handleSubmit(event) {
    // Prepare
    event.preventDefault();
    this.setState({
      error_name: false,
      error_file: false,
      error_name_msg: '',
      error_file_msg: '',
      processing: true
    });
    // Validate and submit
    if (this.validateForm()) {
      this.postJob();
    } else {
      this.setState({
        processing: false,
        uploading: false,
      });
    }
  }

  validateForm() {
    var valid = true
    if (this.state.name == '') {
      this.setState({error_name: true, error_name_msg: 'Job name required'});
      valid = false
    }
    if (this.state.input_file == '' || this.state.file == '') {
      this.setState({error_file: true, error_file_msg: 'Input file required'});
      valid = false
    }
    return valid
  }

  postJob() {
    const data = new FormData();
    data.append('name', this.state.name);
    data.append('input_file', this.state.filename);
    data.append('file', this.state.file);
    const config = {
      onUploadProgress: this.updateUploadProgress
    };
    axios.post('/api/v1/submit/', data, config)
      .then(resp => {
        this.props.addJobData(resp.data);
        this.setState({
          processing: false,
          uploading: false,
          upload_complete: true,
          token: resp.data.uuid,
        });
      })
      .catch(error => {
        this.setState({processing: false});
        if (error.response) {
          if ('name' in error.response.data) {
            this.setState({error_name: true, error_name_msg: error.response.data['name']});
          }
          if ('input_file' in error.response.data) {
            this.setState({error_file: true, error_file_msg: error.response.data['input_file']});
          }
          if ('file' in error.response.data) {
            this.setState({error_file: true, error_file_msg: error.response.data['file']});
          }
        } else {
          console.log(error)
        }
      });
  }

  render() {
    return (
      <>
        <Header as='h1'>Submit a job</Header>
        <Message
          icon='info circle'
          size='mini'
          header='We accept multiple file formats'
          content='Spectra can be packaged into either a .zip or .tar.gz archive'
        />
        <Form>
          <Form.Input
            label='Job name'
            error={this.state.error_name ? {content: this.state.error_name_msg, pointing: 'below'} : false}
            onChange={this.handleNameChange}
          />
          <Form.Input
            label='Input file'
            value={this.state.filename == '' ? 'Select file...' : this.state.filename}
            error={this.state.error_file ? {content: this.state.error_file_msg, pointing: 'below'} : false}
            input={<input disabled />}
            actionPosition='left'
            action={
              <Button
                icon='upload'
                type='button'
                onClick={() => this.fileInputRef.current.click()}
              />
            }
          />
          <input
            type='file'
            ref={this.fileInputRef}
            hidden
            onChange={this.handleFileChange}
          />
          <Transition visible={this.state.uploading || this.state.upload_complete}>
            <Progress
              color='blue'
              progress='value'
              active={this.state.processing}
              success={this.state.upload_complete}
              value={this.state.progress}
              label={this.state.upload_complete ? 'Upload Complete' : 'Uploading File' }
            />
          </Transition>
          <Button
            primary
            disabled={this.state.processing || this.state.upload_complete}
            content='Submit'
            type='submit'
            onClick={this.handleSubmit}
          />
        </Form>
        <SubmitModal
          token={this.state.token}
          upload_complete={this.state.upload_complete}
        />
      </>
    );
  }
}

export default SubmitPage;
