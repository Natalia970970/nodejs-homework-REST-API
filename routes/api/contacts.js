const express = require('express');
const ctrl = require('../../controllers/contacts');
const {validateBody, isValidId} = require('../../midllewares');
const {addSchema, updateFavoriteSchema} = require('../../models/contact');
const router = express.Router();

router.get('/', ctrl.getAllContacts);
router.get('/:contactId', isValidId, ctrl.getContactByID);
router.post('/', validateBody(addSchema), ctrl.addContact);
router.delete('/:contactId', isValidId, ctrl.deleteContactById);
router.put('/:contactId', isValidId, validateBody(addSchema), ctrl.updateContactById);
router.patch('/:contactId/favorite', isValidId, validateBody(updateFavoriteSchema), ctrl.updateFavorite);

module.exports = router;
