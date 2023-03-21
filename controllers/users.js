const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const path = require('path');
const fs =require("fs").promises;
const Jimp = require("jimp");
const {nanoid} = require("nanoid");
const {User} = require('../models/user');
const {ctrlWrapper, HttpError, sendEmail} = require('../helpers');

const {SECRET_KEY, BASE_URL} =  process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});

    if(user) {
        throw HttpError(409, "Email in use")
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarUrl = gravatar.url(email);
    const verificationToken = nanoid();
    const newUser = await User.create({...req.body, password: hashPassword, avatarUrl, verificationToken});
    const verifyEmail = {
        to: email,
        subject: "Veryfy email",
        html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click verify email</a>`
    };

    await sendEmail(verifyEmail);

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

const verifyEmail = async(req, res) => {
    const {verificationToken} = req.params;
    const user = await User.findOne({verificationToken});
    if(!user) {
        throw HttpError(404, 'User not found');
    }
    await User.findByIdAndUpdate(user._id,{verify: true, verificationToken: null});

    res.json({
        message: 'Verification successful',
    })
}

const resendVerifyEmail = async(req, res) => {
    const {email} = req.params;
    const user = User.findOne({email});
    if(!user) {
        throw HttpError(400, "missing required field email");
    }
    if(user.verify) {
        throw HttpError(400, "Verification has already been passed");
    }
    const verifyEmail = {
        to: email,
        subject: "Veryfy email",
        html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click verify email</a>`
    };

    await sendEmail(verifyEmail);

    res.json({
        message: "Verification email sent",
    })
}

const login = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        throw HttpError(401, "Email or password is wrong");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);

    if(!user.verify) {
        throw HttpError(401, "Email not verify");
    }

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
    verifyEmail: ctrlWrapper(verifyEmail),
    resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateAvatar: ctrlWrapper(updateAvatar),
}