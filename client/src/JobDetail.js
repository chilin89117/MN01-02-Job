import React, {Component} from 'react';
import {Link} from 'react-router-dom';
// import {jobs} from './fake-data';
import {loadJob} from './requests';

export class JobDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {job: null};
  }

  // Load data into state variable
  async componentDidMount() {
    const {jobId} = this.props.match.params;
    const job = await loadJob(jobId);
    this.setState({job});
  };

  render() {
    const {job} = this.state;
    // Do not display data if 'job' is null, otherwise 'job.title' will be an error
    if(!job) return null;
    return (
      <div>
        <h1 className="title">{job.title}</h1>
        <h2 className="subtitle">
          <Link to={`/companies/${job.company.id}`}>{job.company.name}</Link>
        </h2>
        <div className="box">{job.description}</div>
      </div>
    );
  }
}
