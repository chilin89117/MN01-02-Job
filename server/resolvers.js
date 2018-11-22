const db = require('./db');

// Each resolver receives 4 arguments:
// 1. parent/root object
// 2. arguments
// 3. context (to access things outside GraphQL server)
// 4. info

const Query = {
  jobs: () => db.jobs.list(),
  job: (root, {id}) => db.jobs.get(id),
  company: (root, {id}) => db.companies.get(id)
};
const Company = {
  // Resolve 'jobs' field in a company where the parent/root argument is the company
  jobs: (company) => db.jobs.list().filter(j => j.companyId === company.id)
}
const Job = {
  // Resolve 'company' field in a job where the parent/root argument is the job
  company: (job) => db.companies.get(job.companyId)
}

const Mutation = {
  createJob: (root, {data}, {user}) => {
    if(!user) throw new Error('Unauthorized');
    const newJobId =  db.jobs.create({companyId: user.companyId, ...data});
    return db.jobs.get(newJobId);
  }
}

module.exports = {Query, Company, Job, Mutation};
