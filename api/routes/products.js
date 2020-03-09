const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const Product = require('../models/product');

// GET all products
router.get('/', (req, res) => {
  Product
    .find()
    .select('name price _id productImage')
    .exec()
    .then(prod => {
      const response = {
        count: prod.length,
        products: prod.map(product => {
          return {
            name: product.name,
            price: product.price,
            productImage: product.productImage,
            id: product._id,
            request: {
              type: 'GET',
              url: `http://localhost:3000/products/${product._id}`
            }
          }
        })
      };
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// POST a new product
router.post('/', upload.single('productImage'), (req, res) => {
  const product = new Product({
    _id: mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  });
  product
    .save()
    .then(result => {
      res.status(201).json({
        message: "Product successfully created",
        product: {
          name: result.name,
          price: result.price,
          productImage: result.productImage,
          id: result._id,
          request: {
            type: 'POST',
            url: `http://localhost:3000/products/${result._id}`
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// GET a single product
router.get('/:productID', (req, res) => {
  const id = req.params.productID;

  Product
    .findById(id)
    .select('name price _id')
    .exec()
    .then(doc => {
      if (doc !== null) {
        res.status(200).json({
          name: doc.name,
          price: doc.price,
          productImage: doc.productImage,
          id: doc._id,
          request: {
            type: 'POST',
            url: `http://localhost:3000/products/${doc._id}`
          }
        });
      } else {
        res.status(404).json({
          message: 'Not found'
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// UPDATE info about single product
router.patch('/:productID', (req, res) => {
  const id = req.params.productID;

  const updateOps = Object.create(req.body);
  Product
    .updateOne({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: 'Product was successfully updated',
        request: {
          type: 'PATCH',
          url: `http://localhost:3000/products/${id}`
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// DELETE single product
router.delete('/:productID', (req, res) => {
  const id = req.params.productID;

  Product
    .remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Product was successfully deleted',
        request: {
          type: 'DELETE'
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});


module.exports = router;