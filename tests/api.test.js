const { mock, test, describe, before, it } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

// Mock mongoose.connect BEFORE importing app so we don't connect to Atlas
mock.method(mongoose, 'connect', async () => {
  return {
    connection: {
      host: 'mocked-mongodb'
    }
  };
});

const app = require('../server');
const request = require('supertest');
const Product = require('../models/product');
const User = require('../models/user');

describe('Backend API Tests', () => {
  test('GET / - should return server running message', async () => {
    const res = await request(app)
      .get('/')
      .expect(200);

    assert.strictEqual(res.text, 'Shoe Smart Catalog API is running smoothly...');
  });

  describe('Products Endpoints', () => {
    test('GET /api/products - should return list of products', async () => {
      // Mock Product.find to support chaining .sort()
      mock.method(Product, 'find', () => {
        return {
          sort: async () => {
            return [
              { _id: '1', name: 'Running Shoes', price: 99.99, sizes: [10], category: 'Sneakers' }
            ];
          }
        };
      });

      const res = await request(app)
        .get('/api/products')
        .expect(200);

      assert.strictEqual(res.body.length, 1);
      assert.strictEqual(res.body[0].name, 'Running Shoes');
    });

    test('GET /api/products/:id - should return a single product', async () => {
      // Mock Product.findById
      mock.method(Product, 'findById', async (id) => {
        if (id === '1') {
          return { _id: '1', name: 'Running Shoes', price: 99.99, sizes: [10] };
        }
        return null;
      });

      // Valid id test
      const res = await request(app)
        .get('/api/products/1')
        .expect(200);
      assert.strictEqual(res.body.name, 'Running Shoes');

      // Invalid id/not found test
      mock.method(Product, 'findById', async () => null);
      await request(app)
        .get('/api/products/999')
        .expect(404);
    });

    test('DELETE /api/products/:id - should fail with 403 if not authenticated as admin', async () => {
      await request(app)
        .delete('/api/products/1')
        .expect(403);
    });
  });

  describe('Authentication Endpoints', () => {
    test('POST /api/auth/register - should fail with missing input fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      assert.strictEqual(res.body.message, 'Please provide name, email, and password');
    });
  });
});
