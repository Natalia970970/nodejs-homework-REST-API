const {Contact} = require('../models/contact');
const {ctrlWrapper} = require('../helpers');

const getAllContacts = async (req, res) => {
        const {_id: owner} = req.user;
        const result = await Contact.find({owner});
        res.json(result);
}

const getContactByID = async (req, res) => {
        const {contactId} = req.params;
        const result = await Contact.findById(contactId);
        if(!result) {
                return res.status(404).json({message: 'Not found'})
        }
        res.json(result);
}

const addContact = async (req, res) => {
        const {_id: owner} = req.user;
        const result = await Contact.create({...req.body, owner});
        res.status(201).json(result)
}

const updateContactById = async (req, res) => {
        const {contactId} = req.params;
        const result = await Contact.findByIdAndUpdate(contactId, req.body, {new: true});
        res.status(200).json(result)
}

const updateFavorite = async (req, res) => {
        const {contactId} = req.params;
        const result = await Contact.findByIdAndUpdate(contactId, req.body, {new: true});
        if(!result) {
                return res.status(400).json({message: 'missing field favorite'});
        }
        res.status(200).json(result)
}

const deleteContactById = async (req, res) => {
        const {contactId} = req.params;
        const result = await Contact.findByIdAndRemove(contactId);
        if(!result) {
                return res.status(404).json({message: 'Not found'})
        }
        res.status(200).json({"message": "contact deleted"});
}

module.exports = {
    getAllContacts: ctrlWrapper(getAllContacts),
    getContactByID: ctrlWrapper(getContactByID),
    addContact: ctrlWrapper(addContact),
    updateContactById: ctrlWrapper(updateContactById),
    updateFavorite: ctrlWrapper(updateFavorite),
    deleteContactById: ctrlWrapper(deleteContactById),
}