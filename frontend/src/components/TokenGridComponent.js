import React from 'react';
import { Grid, Button, Header, Icon, Segment, Transition } from 'semantic-ui-react'


import history from '../history';
import './TokenGridComponent.css'


import TimeAgo from 'timeago-react';


class TokenGridComponent extends React.Component {
  constructor(props) {
    super(props)
    this.handleDataClick = this.handleDataClick.bind(this);
  }

  handleDataClick(token) {
    history.push(`/results/${token}/`);
  }

  render() {
    if (this.props.job_data.length == 0) {
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
        <Transition.Group
          id='token_grid'
          as={Grid}
          divided='vertically'
          duration={200}
          animation='fade'
          columns={2}
        >
          {this.props.job_data.slice().reverse().map(d =>
            <Grid.Row key={d.uuid}>
              <Grid.Column id='data_column'>
                <Header as='h4' image>
                  {renderJobIcon(d.status)}
                  <Header.Content as='a' onClick={() => this.handleDataClick(d.uuid)}>
                    {d.name}
                    <Header.Subheader>
                      {d.uuid}
                    </Header.Subheader>
                    <Header.Subheader>
                      {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                    </Header.Subheader>
                    <Header.Subheader>
                      Submitted <TimeAgo live={false} datetime={d.created_at} />
                    </Header.Subheader>
                  </Header.Content>
                </Header>
              </Grid.Column>
              <Grid.Column verticalAlign='middle' id='button_column'>
                <Icon as='i' id='delete_button' name='trash alternate outline' color='red' onClick={() => this.props.removeJobData(d.uuid)} />
              </Grid.Column>
            </Grid.Row>
          )}
        </Transition.Group>
      );
    }
  }
}


function renderJobIcon(job_status) {
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

export default TokenGridComponent;
