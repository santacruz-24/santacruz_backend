"use strict";
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const db = require("../../config/db.config");

const Auth = {
  createUser: async (name, email, phone, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const status = "active"; // or set to your desired default status
    const role = "user";

    const query =
      "INSERT INTO Users (username, email, phone, password, status, role) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [name, email, phone, hashedPassword, status, role];
    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) reject(err);
        console.log(result);
        resolve({ userId: result.insertId, email, name });
      });
    });
  },

  loginUser: async (email, password) => {
    const query =
      "SELECT id,username,password,status,phone,role FROM Users WHERE email = ? AND deleted_at IS NULL";
    const values = [email];

    return new Promise((resolve, reject) => {
      db.query(query, values, async (err, result) => {
        if (err) {
          reject(err);
        } else if (result.length === 0 || result[0].deleted_at == 1) {
          resolve(null); // User not found
        } else {
          const match = await bcrypt.compare(password, result[0].password);
          if (match) {
            resolve(result[0]); // Successful login
          } else {
            resolve(null); // Incorrect password
          }
        }
      });
    });
  },

  checkUserExists: (email, phone) => {
    const query = "SELECT id FROM Users WHERE email = ? OR phone = ?";
    const values = [email, phone];

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result && result.length > 0);
        }
      });
    });
  },
  PasswordResetOtp: (email, otp) => {
    const query = "SELECT id FROM Users WHERE email = ?";
    const values = [email];

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASS,
      }
    });

    const sendEmail = (email, otp) => {
      const mailOptions = {
        from: 'it.santacruz24@gmail.com',
        to: email,
        subject: 'Password Reset Request',
        text: `Dear User,

We received a request to reset your password for your Santa Cruz account. To proceed with the password reset, please use the One-Time Password (OTP) provided below:

Your OTP: ${otp}

This OTP is valid for the next 10 minutes. If you did not request a password reset, please ignore this email or contact our support team immediately.

For security reasons, please do not share this OTP with anyone.

Thank you,
Zenanvibe Support Team`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Email send error:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    };

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          const emailExists = result && result.length > 0;
          if (emailExists) {
            sendEmail(email, otp);
          }
          resolve(emailExists);
        }
      });
    });
  },
  PasswordReset: async (email, password) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = "UPDATE Users SET password = ? WHERE email = ?";
      const values = [hashedPassword, email];

      return new Promise((resolve, reject) => {
        db.query(query, values, (err, result) => {
          if (err) {
            reject(err);
          } else {
            console.log(result);
            resolve(result.affectedRows > 0); // Resolve true if update was successful
          }
        });
      });
    } catch (error) {
      throw new Error(`Error resetting password: ${error.message}`);
    }
  },

  checkUserVerified: (email) => {
    const query = "SELECT id FROM Users WHERE email_verification = 1 and email = ?";
    const values = [email];

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result && result.length > 0);
        }
      });
    });
  },


  generateJWT: (userId, email, name, role) => {
    const secretKey = process.env.JWT_SECRET;
    const token = jwt.sign({ userId, email, name, role }, secretKey, {
      expiresIn: "7d",
    });
    return token;
  },

  updateEmailVerification: (email) => {
    const query = "UPDATE Users SET email_verification = 1 WHERE email =?";
    const values = [email];

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },
};

module.exports = Auth;
