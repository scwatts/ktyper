import React from 'react';
import { Router, Route, Switch } from "react-router-dom";
import { Container } from 'semantic-ui-react'


import history from "./history";


import HomePage from './HomePage'
import JobsPage from './JobsPage'
import MissingPage from './MissingPage'
import MenuComponent from './components/MenuComponent'
import ResultsPage from './ResultsPage'
import SubmitPage from './SubmitPage'


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {job_data: []};
    this.addJobData = this.addJobData.bind(this);
    this.removeJobData = this.removeJobData.bind(this);
    this.updateJobData = this.updateJobData.bind(this);
  };

  addJobData(data) {
    // Remove job data to restack if present
    if (this.state.job_data.findIndex(d => d.uuid == data.uuid) > -1) {
      this.removeJobData(data.uuid);
    }
    // Add
    this.setState({job_data: this.state.job_data.concat(data)}, () => this.writeLocalStorage(this.state));
  }

  removeJobData(uuid) {
    this.setState(
      {job_data: this.state.job_data.filter(d => d.uuid != uuid)},
      () => this.writeLocalStorage(this.state)
    );
  }

  updateJobData(data) {
    this.setState(
      {
        job_data: this.state.job_data.map(d => {
          if (d.uuid == data.uuid) {
            return data;
           } else {
             return d;
           }
        })
      },
      () => this.writeLocalStorage(this.state)
    );
  }

  writeLocalStorage(state) {
    localStorage.setItem('job_data', JSON.stringify(state.job_data));
  }

  componentDidMount() {
    if (localStorage.hasOwnProperty('job_data')) {
      var job_data_json = localStorage.getItem('job_data');
      this.setState({'job_data': JSON.parse(job_data_json)});
    }
  }

  render() {
    return (
      <>
        <Router history={history}>
          <MenuComponent />
          <Container text style={{ marginTop: '7em' }}>
              <Switch>
                <Route exact path='/'>
                  <HomePage />
                </Route>
                <Route exact path='/submit'>
                  <SubmitPage
                    addJobData={this.addJobData}
                  />
                </Route>
                <Route exact path='/jobs'>
                  <JobsPage
                    job_data={this.state.job_data}
                    addJobData={this.addJobData}
                    removeJobData={this.removeJobData}
                    updateJobData={this.updateJobData}
                  />
                </Route>
                {/* two routes for results; one with token and one without */}
                <Route exact path='/results/:token/'
                  render={props => <ResultsPage
                      addJobData={this.addJobData}
                      updateJobData={this.updateJobData}
                      removeJobData={this.removeJobData}
                      {...props}
                    />
                  }
                />
                <Route path='/results'>
                  <ResultsPage
                    addJobData={this.addJobData}
                    updateJobData={this.updateJobData}
                  />
                </Route>
                <Route path='/*'>
                  <MissingPage />
                </Route>
              </Switch>
          </Container>
        </Router>
      </>
    );
  }
}

export default App;
