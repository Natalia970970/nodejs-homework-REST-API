const express = require('express');
const ctrl = require('../../controllers/users')
const {validateBody, authenticate, upload} = require('../../midllewares');
const { schemas } =  require('../../models/user');
const router = express.Router();

router.post("/register", validateBody(schemas.authSchema), ctrl.register);
router.get("/verify/:verificationToken", ctrl.verifyEmail);
router.post("/verify", validateBody(schemas.emailSchema), ctrl.resendVerifyEmail);
router.post("/login", validateBody(schemas.authSchema), ctrl.login);
router.get("/current", authenticate, ctrl.getCurrent);
router.post("/logout", authenticate, ctrl.logout);
router.patch("/avatars", authenticate, upload.single("avatar"), ctrl.updateAvatar);

module.exports = router;
