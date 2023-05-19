const orderModel = require('./orders.model');
module.exports = {
    Query: {
        orders: async () => {
            console.log('Getting the orders');
            return orderModel.getAllOrders();
        }
    }
}