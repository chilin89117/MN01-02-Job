import {ApolloClient} from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {HttpLink} from 'apollo-link-http';
import {onError} from 'apollo-link-error';
import {ApolloLink} from 'apollo-link';
import gql from 'graphql-tag';
import {getAccessToken, isLoggedIn} from './auth';

// Set authorization header ===============================
const requestLink = new ApolloLink((operation, forward) => {
  if(isLoggedIn()) operation.setContext({
    headers: {
      'authorization': 'Bearer ' + getAccessToken()
    }
  })
  return forward(operation);
});
// Apollo client ==========================================
const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({graphQLErrors, networkError}) => {
      if (graphQLErrors)
        graphQLErrors.map(({message, locations, path}) =>
          console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`));
      if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    requestLink,    // Must be before HttpLink
    new HttpLink({
      uri: 'http://localhost:4000/graphql',
      credentials: 'same-origin'    // Cors is used
    })
  ]),
  cache: new InMemoryCache()
});
// Job detail fragment definition =========================
const jobDetailFragment = gql`
  fragment jobDetail on Job {
    id title company{id name} description
  }
`;
// Load jobs ==============================================
const loadJobsQuery = gql`
  query loadJobsQuery {
    jobs {...jobDetail}
  }
  ${jobDetailFragment}
`;
export const loadJobs = async () => {
  const {data: {jobs}} = await client.query({
    query: loadJobsQuery,
    fetchPolicy: 'no-cache'
  });
  return jobs;
};
// Load one job by id =====================================
const loadJobQuery = gql`
  query JobQuery($id:ID!) {
    job(id:$id) {...jobDetail}
  }
  ${jobDetailFragment}
`;
export const loadJob = async (id) => {
  const {data: {job}} = await client.query({query: loadJobQuery, variables: {id}});
  return job;
};
// Load company by id =====================================
const loadCompanyQuery = gql`
  query loadCompanyQuery($id:ID!) {
    company(id:$id) {id name description jobs{id title}}
  }
`;
export const loadCompany = async (id) => {
  const {data: {company}} = await client.query({
    query: loadCompanyQuery,
    variables: {id}
  });
  return company;
};
// Create a new job =======================================
const createJobMutation = gql`
  mutation CreateJobMutation($data:CreateJobInput!) {
    job: createJob(data:$data) {...jobDetail}
  }
  ${jobDetailFragment}
`;
export const createJob = async (data) => {
  const {data: {job}} = await client.mutate({
    mutation: createJobMutation, 
    variables: {data},
    update: (cache, {data}) => {
      cache.writeQuery({
        query: loadJobQuery,
        variables: {id: data.job.id},
        data  // Data from mutation result to be written to cache
      })
    }
  });
  return job;
};
