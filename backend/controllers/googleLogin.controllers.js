/* This is the googleOauth controllers section, where we write the logic to get userInfo and send jwt token via googleApi credentials we have taken*/

import { oauth2client } from '../utils/googleAuth.utils.js'
import UserModel from '../models/user.models.js'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import { google } from 'googleapis'
// import { transporter } from "../nodemailer/nodemailerConfig.js";

export const googleAuthLogin = async (req, res) => {
    try {
        const { code } = req.query
        const googleRes = await oauth2client.getToken(code)
        oauth2client.setCredentials(googleRes.tokens)

        const userData = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        )

        const {name, email} = userData.data
        let user = await UserModel.findOne({
            email
        })

        if(!user) {
            user = await UserModel.create({
                name,
                isVerified: true,
                email
            })

            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: email,
                subject: "HackSprint",
                text: `Welcome to HackSprint. Your account has been created using this email ${email}`,
              };
          
              await transporter.sendMail(mailOptions);
        }

        const { _id } = user
        const token = jwt.sign({ _id, email},
            process.env.SECRET_KEY, 
            {
                expiresIn: process.env.JWT_EXPIRE_TIME
            }
        )

        return res.status(200).json({
            message: "success",
            token,
            user
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server Error...."
        })
    }
}

export const userData = async (req, res) => {
    try {
        const {email} = req
        const userData = await UserModel.findOne({
            email
        })

        if(!userData) {
            return res.status(504).json({
                message: "User not in db...."
            })
        }

        return res.status(200).json({
            userData,
            success: true
        })
    } catch (error) {
        return res.status(500).json({
            message: "Error...",
            success: false
        })
    }
}