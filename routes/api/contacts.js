const express = require('express');
const ctrl = require('../../controllers/contacts');
const {validateBody, isValidId, authenticate} = require('../../midllewares');
const {addSchema, updateFavoriteSchema} = require('../../models/contact');
const router = express.Router();

router.get('/', authenticate, ctrl.getAllContacts);
router.get('/:contactId', authenticate, isValidId, ctrl.getContactByID);
router.post('/', authenticate, validateBody(addSchema), ctrl.addContact);
router.delete('/:contactId', authenticate, isValidId, ctrl.deleteContactById);
router.put('/:contactId', authenticate, isValidId, validateBody(addSchema), ctrl.updateContactById);
router.patch('/:contactId/favorite', authenticate, isValidId, validateBody(updateFavoriteSchema), ctrl.updateFavorite);

module.exports = router;
