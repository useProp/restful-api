const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

// GET all orders
router.get('/', (req, res) => {
  Order
    .find()
    .select('product quantity _id')
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(order => {
          return {
            id: order._id,
            product: order.product,
            quantity: order.quantity,
            request: {
              type: 'GET',
              url: `http://localhost:3000/orders/${order._id}`
            }
          }
        })
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// POST new order
router.post('/', (req, res) => {
  const id = req.body.productID;

  Product
    .findById({ _id: id })
    .then(prod => {
      if (prod !== null) {
        const order = new Order({
          _id: mongoose.Types.ObjectId(),
          product: req.body.productID,
          quantity: req.body.quantity
        });

        return order.save();
      } else {
        throw new Error('Not found');
      }
    })
    .then(order => {
      res.status(201).json({
        id: order._id,
        product: order.product,
        quantity: order.quantity
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });;
});

// GET single order
router.get('/:orderID', (req, res) => {
  const id = req.params.orderID

  Order
    .findById({ _id: id })
    .select('product quantity _id')
    .exec()
    .then(order => {
      res.status(200).json({
        id: order._id,
        product: order.product,
        quantity: order.quantity
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

// DELETE single order
router.delete('/:orderID', (req, res) => {
  const id = req.params.orderID;

  Order
    .remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Order deleted'
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;