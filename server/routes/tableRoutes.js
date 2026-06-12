const express = require('express');
const router = express.Router();
const {
  getTables,
  getTableByNumber,
  createTable,
  updateTable,
  deleteTable,
  regenerateQR,
} = require('../controllers/tableController');
const protect = require('../middleware/auth');

router.get('/', protect, getTables);
router.get('/:number', getTableByNumber);
router.post('/', protect, createTable);
router.put('/:id', protect, updateTable);
router.delete('/:id', protect, deleteTable);
router.post('/:id/regenerate-qr', protect, regenerateQR);

module.exports = router;
