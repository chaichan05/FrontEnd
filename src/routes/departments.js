const express = require('express');
const router  = express.Router();
const { getDepartments, getDepartmentById } = require('../controllers/departmentController');

router.get('/',    getDepartments);
router.get('/:id', getDepartmentById);

module.exports = router;
