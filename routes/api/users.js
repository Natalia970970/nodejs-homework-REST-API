const express = require('express');
const ctrl = require('../../controllers/users')
const {validateBody, authenticate, upload} = require('../../midllewares');
const { authSchema } =  require('../../models/user');
const router = express.Router();

router.post("/register", validateBody(authSchema), ctrl.register);
router.post("/login", validateBody(authSchema), ctrl.login);
router.get("/current", authenticate, ctrl.getCurrent);
router.post("/logout", authenticate, ctrl.logout);
router.patch("/avatars", authenticate, upload.single("avatar"), ctrl.updateAvatar);

module.exports = router;
