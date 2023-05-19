const express = require('express');
const {createHandler} = require('graphql-http/lib/use/http');
const {loadFilesSync} = require('@graphql-tools/load-files');
const {makeExecutableSchema} = require('@graphql-tools/schema');

const typeArray = loadFilesSync('**/*',{extensions:['graphql']});
const resolversArray = loadFilesSync('**/*',{extensions: ['resolvers.js']});
const schema = makeExecutableSchema({
    typeDefs: typeArray,
    resolvers: resolversArray
});
const rootValue = {
   products: require('./products/products.model'),
   orders: require('./orders/orders.model').default,
};

const app = express();
app.all('/graphql',createHandler({schema, rootValue}));

app.get('/',(req,res)=>{
    res.send('hello')
});

app.listen(3000,()=>{
    console.log('server running on: 3000')
})