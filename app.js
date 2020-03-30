const express = require("express");
const bodyParser = require('body-parser');
//it exports a func that we can use in the place where
//express expects a middleware. It will funnel the request
const graphqlHttp = require("express-graphql");
const mongoose = require("mongoose");

const graphQlSchema = require("./graphql/schema/index");
const graphQlResolvers = require("./graphql/resolvers/index");
const isAuth = require("./middleware/is-auth");

const app = express();

app.use(bodyParser.json());

//middleware to check is user is authenticated
//we wont lock /graphql down, but instead let
//graphql know, (req.isAuth = false) if is Authenticated
app.use(isAuth);

app.use('/graphql', graphqlHttp({
    //tells app where to find schema
    schema: graphQlSchema,
    //tells app where to find resolver functions. 
    //They need to match the schema endpoints by name.
    rootValue: graphQlResolvers,
    graphiql: true
  })
);

mongoose
.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-ruxnn.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
.then(() => {
  //start up server if success
  app.listen(8000, () => console.log("listening"));
})
.catch(err=>console.log(err));
