const express = require("express");
const router = express.Router();
const authController = require("./bill.controller");
const authenticateJwt = require("../middleware/authenticateJWT");

/**
 * @swagger
 * info:
 *   version: 1.0.0
 *   title: Inseatfood Signup API
 *   description: API to sign up new users and retrieve JWT token for authentication.
 *
 * paths:
 *   /api/v1/users/:
 *     get:
 *       tags:
 *         - Users
 *       summary: get all the users.
 *       description: get all the user informations.
 *       produce:
 *         - application/json
 *       parameters:
 *         - name: Authorization
 *           in: header
 *           type: string
 *           description: JWT token for user authentication.
 *           example: "your_jwt_token_here"
 *       responses:
 *         200:
 *           description: List of userss retrieved successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   data:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                           description: The unique identifier for the user.
 *                         name:
 *                           type: string
 *                           description: The name of the users.
 *                         email:
 *                           type: string
 *                           description: The address of the users.
 *                         status:
 *                           type: string
 *                           description: The status of the users.
 *                         phone:
 *                           type: integer
 *                           description: The contact phone number of the users.
 *
 *   /api/v1/users/:userId:
 *     get:
 *       tags:
 *         - Users
 *       summary: get particular the users.
 *       description: get particular user informations.
 *       produce:
 *         - application/json
 *       parameters:
 *         - name: Authorization
 *           in: header
 *           type: string
 *           description: JWT token for user authentication.
 *           example: "your_jwt_token_here"
 *       responses:
 *         200:
 *           description:  users data retrieved successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   data:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: integer
 *                           description: The unique identifier for the user.
 *                         name:
 *                           type: string
 *                           description: The name of the users.
 *                         email:
 *                           type: string
 *                           description: The address of the users.
 *                         status:
 *                           type: string
 *                           description: The status of the users.
 *                         phone:
 *                           type: integer
 *                           description: The contact phone number of the users.
 *   /api/v1/users/{userId}:
 *     put:
 *       tags:
 *         - Users
 *       summary: Update user information.
 *       description: Used to update user information based on user ID.
 *       consumes:
 *         - application/json
 *       parameters:
 *         - name: Authorization
 *           in: header
 *           type: string
 *           description: JWT token for user authentication.
 *           example: "your_jwt_token_here"
 *         - name: userId
 *           in: path
 *           type: integer
 *           required: true
 *           description: The user's ID.
 *         - name: updatedData
 *           in: body
 *           required: true
 *           description: The updated user data.
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               status:
 *                 type: string
 *               phone:
 *                 type: string
 *       responses:
 *         200:
 *           description: User updated successfully.
 *         500:
 *           description: Internal Server Error.
 *
 *     delete:
 *       tags:
 *         - Users
 *       summary: Delete user information.
 *       description: Used to update user information based on user ID.
 *       consumes:
 *         - application/json
 *       parameters:
 *         - name: Authorization
 *           in: header
 *           type: string
 *           description: JWT token for user authentication.
 *           example: "your_jwt_token_here"
 *         - name: userId
 *           in: path
 *           type: integer
 *           required: true
 *           description: The user's ID.
 *       responses:
 *         200:
 *           description: User updated successfully.
 *         500:
 *           description: Internal Server Error.
 *
 */

router.post("/add_cc_bill", authenticateJwt, authController.add_cc_bill);
router.post("/add_insurance_bill", authenticateJwt, authController.add_insurance_bill);
router.post("/add_house_hold_bill", authenticateJwt, authController.add_house_hold_bill);
router.get("/getExpenseInfo", authenticateJwt, authController.getExpenseInfo);
router.get("/getCCbills", authenticateJwt, authController.get_CC_bill_Info);
router.delete("/deleteCCbill/:id", authenticateJwt, authController.delete_CC_bill);
router.get("/getpaidCCbills", authenticateJwt, authController.get_paid_CC_bill_Info);
router.get("/getInsurancebills", authenticateJwt, authController.get_insurance_bill_Info);
router.post("/payinsurancebill/:id", authenticateJwt, authController.Pay_Insurance_bill);
router.get("/getpaidInsurancebills", authenticateJwt, authController.get_paid_insurance_bill_Info);
module.exports = router;
