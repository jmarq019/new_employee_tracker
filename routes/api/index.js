const router = require('express').Router();
const employeeRoutes = require('./employees');
const roleRoutes = require('./roles');
const departmentRoutes = require('./departments');


router.use('/employees', employeeRoutes);

router.use('/roles', roleRoutes);

router.use('/departments', departmentRoutes);


module.exports = router;