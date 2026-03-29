const express = require('express');
const router  = express.Router();
const {
  getAddresses,
  getAddressById,
  getAddressByUserId,
  createAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/addressController');

router.get('/',           getAddresses);
router.get('/:id',        getAddressById);
router.get('/user/:userId', getAddressByUserId);
router.post('/',          createAddress);
router.put('/:id',        updateAddress);
router.delete('/:id',     deleteAddress);

module.exports = router;
