import React from 'react'
import { Container, Button, Header, Modal } from 'semantic-ui-react'


import history from '../history';
import './SubmitModal.css'


class SubmitModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
       open: this.props.upload_complete
    };
  }

  componentDidUpdate(prevProps) {
		if (this.props.upload_complete !== prevProps.upload_complete) {
      this.setState({ open: this.props.upload_complete });
    }
  }

  render() {
    return (
      <Modal
        onClose={() => this.setState({ open: false })}
        onOpen={() => this.setState({ open: true })}
        open={this.state.open}
        size='tiny'
      >
        <Header icon='checkmark' content='Successful Job Submission' />
        <Modal.Content>
          <p>You may use this job token to access results at a later time:</p>
          <Container textAlign='center'>
            <Header id='submit_modal_token' as='h3'>{this.props.token}</Header>
          </Container>
        </Modal.Content>
        <Modal.Actions id='submit_modal_actions'>
          <Button color='blue' onClick={() => history.push(`/results/${this.props.token}/`)}>
            Job results
          </Button>
          <Button color='black' onClick={() => history.push('/jobs')}>
            Job list
          </Button>
          <Button color='grey' onClick={() => this.props.resetForm()}>
            Submit another job
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default SubmitModal;
