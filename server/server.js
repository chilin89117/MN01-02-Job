const fs = require('fs');
const cors = require('cors');
const express = require('express');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const port = 4000;
const jwtSecret = Buffer.from('Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt', 'base64');
app.use(cors(), express.json(), expressJwt({
  secret: jwtSecret,
  credentialsRequired: false
}));

// 'apollo-server-express' 2.2.2 ======================================
const {ApolloServer, gql} = require('apollo-server-express');
const typeDefs = gql(fs.readFileSync('./schema.graphql', {encoding: 'utf-8'}));
const resolvers = require('./resolvers');
const graphqlServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({req}) => ({user: req.user && db.users.get(req.user.sub)}), // function with request object
  playground: true  // set to false for production
});
graphqlServer.applyMiddleware({app});   // No need to specify paths
// 'apollo-server-express 1.3.2 code ==================================
// const {makeExecutableSchema} = require('graphql-tools');
// const {graphqlExpress, graphiqlExpress} = require('apollo-server-express');
// const typeDefs = fs.readFileSync('./schema.graphql', {encoding: 'utf-8'});
// const resolvers = require('./resolvers');
// const schema = makeExecutableSchema({typeDefs, resolvers});
// app.use('/graphql', graphqlExpress(req => ({
//   schema,
//   context: {user: req.user && db.users.get(req.user.sub)}
//  })));
// app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}));
// ====================================================================

app.post('/login', (req, res) => {
  const {email, password} = req.body;
  const user = db.users.list().find(user => user.email === email);
  if (!(user && user.password === password)) {
    res.sendStatus(401);
    return;
  }
  const token = jwt.sign({sub: user.id}, jwtSecret);
  res.send({token});
});

app.listen(port, () => console.info(`MN01-02-Job server listening on port ${port}...`));
