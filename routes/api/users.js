const express = require('express');
const ctrl = require('../../controllers/users')
const {validateBody, authenticate} = require('../../midllewares');
const { authSchema } =  require('../../models/user');
const router = express.Router();

router.post("/register", validateBody(authSchema), ctrl.register);
router.post("/login", validateBody(authSchema), ctrl.login);
router.get("/current", authenticate, ctrl.getCurrent);
router.post("/logout", authenticate, ctrl.logout);

module.exports = router;
