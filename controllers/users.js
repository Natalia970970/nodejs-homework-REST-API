const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const path = require('path');
const fs =require("fs").promises;
const Jimp = require("jimp");
const {User} = require('../models/user');
const {ctrlWrapper, HttpError} = require('../helpers');

const {SECRET_KEY} =  process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});

    if(user) {
        throw HttpError(409, "Email in use")
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarUrl = gravatar.url(email);
    console.log(avatarUrl);
    const newUser = await User.create({...req.body, password: hashPassword, avatarUrl});

    res.status(201).json({
        status: "Created",
        ResponseBody: {
            user: {
                email: newUser.email,
                subscription: "starter",
            },
        },
    });
}

const login = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        throw HttpError(401, "Email or password is wrong");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);

    if(!passwordCompare) {
        throw HttpError(401, "Email or password is wrong");
    }

    const payload = {
        id: user._id,
    }
    
    const token = jwt.sign(payload, SECRET_KEY, {expiresIn: '23h'});
    await User.findByIdAndUpdate(user._id, {token});

    res.json({token});
}

const getCurrent = async(req, res) => {
    const {email, subscription} = req.user;
    res.status(200).json({
        email, 
        subscription,
    })
    }

const logout = async(req, res) => {
    const{_id} = req.user;
    await User.findByIdAndUpdate(_id, {token: ""});
    res.status(204).json({
        message: "No Content"
    })
}

const updateAvatar = async(req, res) => {
    const {_id} = req.user;
    const {path: tmpUpload, originalname} = req.file;
    const fileName = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarsDir, fileName);
    await fs.rename(tmpUpload, resultUpload);

    const isValid = await ResizedImage(resultUpload);

    if (!isValid) {
        await fs.unlink(fileName);
        return res
        .status(400)
        .json({ message: "File is not a photo or problem during resizing" });
    }

    const avatarUrl = path.join("avatars", fileName);
    await User.findByIdAndUpdate(_id, {avatarUrl});

    res.json({
        avatarUrl,
    })
}

const ResizedImage = async (imagePath) =>
    new Promise((resolve) => {
        try {
            Jimp.read(imagePath, (error, image) => {
                if (error) {
                    resolve(false);
                } else {
                    image.resize(250, 250).write(imagePath);
                    resolve(true);
                }
            });
        } catch (error) {
            resolve(false);
        }
    });

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateAvatar: ctrlWrapper(updateAvatar),
}