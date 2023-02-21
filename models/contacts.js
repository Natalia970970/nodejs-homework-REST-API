const fs = require('fs').promises;
const path = require('path');

const contactsPath = path.resolve('./models/contacts.json');

async function listContacts() {
  try {
    const response = await fs.readFile(contactsPath);
    const contacts = JSON.parse(response);
    return contacts;
  } catch (error) {
    console.log(error);
  }
}

const getContactById = async (contactId) => {
  try {
    const contacts = await listContacts();
    const findedContact = contacts.find(contact => Number(contact.id) === Number(contactId));
    return findedContact;
} catch (error) {
    console.log(error);
}
}

const removeContact = async (id) => {
  try {
    const contacts = await listContacts();
    const deletedContactIndex = contacts.findIndex(
        contact => contact.id === id
    );
    if (deletedContactIndex === -1) {
        return null;
    }
    const deletedContact = contacts.splice(deletedContactIndex, 1);

    await fs.writeFile(contactsPath, JSON.stringify(contacts,null, 2));
    return deletedContact;
} catch (error) {
    console.log(error);
}
}

const addContact = async ({name, email, phone}) => {
  try {
    const contacts = await listContacts();
    const id = contacts.length + 2;
    const newContact = {
        id: `${id}`,
        name,
        email,
        phone: `${phone}`,
    };
    const newContacts = [...contacts, newContact];
    await fs.writeFile(contactsPath, JSON.stringify(newContacts,null, 2));
    return newContact;
} catch (error) {
    console.log(error);
}
}

const updateContact = async (id, body) => {
  const contacts = await listContacts();
  const index = contacts.findIndex(it => it.id === id);
  if(index === -1) {
    return null;
  }
  contacts[index] = {id, ...body};
  await fs.writeFile(contactsPath, JSON.stringify(contacts,null, 2));
  return contacts[index];
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
