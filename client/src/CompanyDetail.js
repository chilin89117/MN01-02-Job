import React, { Component } from 'react';
import {JobList} from './JobList';
import {loadCompany} from './requests';

export class CompanyDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {company: null};
  }

  // Load data into state variable
  async componentDidMount() {
    const {companyId} = this.props.match.params;
    const company = await loadCompany(companyId);
    this.setState({company});
  };
  
  render() {
    const {company} = this.state;
    if(!company) return null;
    return (
      <div>
        <p className="title">{company.name}</p>
        <div className="box">{company.description}</div>
        <p className="title is-4">Jobs at {company.name}</p>
        <JobList jobs={company.jobs} />
      </div>
    );
  }
}
