const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const mysql = require("mysql");
const logger = require("./logger");
const nodemailer = require('nodemailer');
const cron = require('node-cron');

dotenv.config();

const app = express();
app.use(cors());

const port = process.env.PORT || 3030;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(412).send("No permission to view this");
});

app.get("/server_status", (req, res) => {
  res.status(200).send("SERVER UP");
});

app.get("/dbcheck", (req, res) => {
  if (dbconn) {
    res.status(200).send("DB UP");
  }
});

const authRoutes = require("./src/auth/auth.routes");
const userRoutes = require("./src/user/user.routes");
const communicationRoutes = require("./src/communication/communication.routes");
const billRoutes = require("./src/bill/bill.routes");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/bill", billRoutes);
app.use("/api/v1/communication", communicationRoutes);

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "<Project Name> Api Docs",
      version: "0.1.0",
      description: "<Project Name> Api Docs for all the endpoint api's that has been developed so far.",
      license: {
        name: "<Project Name> Proprietary",
        url: "https://<Project Name>.com",
      },
      contact: {
        name: "Anto Joel ",
        email: "antojoel@<Project Name>.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/",
        description: "Local Server",
      },
      {
        url: "https://api.<Project Name>.in",
        description: "Production Server",
      },
    ],
  },
  apis: ["./src/*/*.routes.js"],
};

const swaggerSpec = swaggerJsdoc(options);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'jijinjebanesh@gmail.com',
    pass: 'qdqv dwkg hqql qgsg',
  }
});

const sendEmail = (email, bankName, ccNo, amount, date, remaining_days) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Credit Card Bill Reminder',
    text: `Your Credit Card Bill is yet to be paid. Details are as follows:
Bank Name: ${bankName}
Credit Card Number: ${ccNo}
Amount Due: ${amount}
Due Date: ${date}
Please consider paying it within ${remaining_days} days.`
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info.response);
      }
    });
  });
};

const sendInsuranceEmail = (email, name, policyNo, amount, date, remaining_days) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Insurance Bill Reminder',
    text: `Your Insurance Bill is yet to be paid. Details are as follows:
Name: ${name}
Policy Number: ${policyNo}
Amount Due: ${amount}
Due Date: ${date}
Please consider paying it within ${remaining_days} days.`
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info.response);
      }
    });
  });
};

// Database connection
const dbconn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

dbconn.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});

cron.schedule('00 09 * * *', () => {
  const query = `
    SELECT bank_name, cc_no, amount, due_date, DATEDIFF(due_date, CURDATE()) AS days_remaining  
    FROM Credit_card_bills 
    WHERE status = 'active' AND due_date <= CURDATE() + INTERVAL 3 DAY
  `;
  
  dbconn.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err.stack);
      return;
    }
    
    results.forEach(row => {
      sendEmail('jebaneshjijin@gmail.com', row.bank_name, row.cc_no, row.amount, row.due_date, row.days_remaining)
        .then(response => {
          console.log('Email sent:', response);
        })
        .catch(error => {
          console.error('Error sending email:', error);
        });
    });
  });
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

cron.schedule('00 09 * * *', () => {
  const query = `
    SELECT i.name, 
           i.policy_no, 
           i.amount, 
           STR_TO_DATE(
               CONCAT(
                   DAY(i.due_from_date), '-', 
                   MONTH(CURDATE()), '-', 
                   YEAR(CURDATE())
               ), 
               '%d-%m-%Y'
           ) AS due_date,
           DATEDIFF(
               STR_TO_DATE(
                   CONCAT(
                       DAY(i.due_from_date), '-', 
                       MONTH(CURDATE()), '-', 
                       YEAR(CURDATE())
                   ), 
                   '%d-%m-%Y'
               ), 
               CURDATE()
           ) AS days_remaining
    FROM Insurance i
    WHERE NOT EXISTS (
        SELECT 1 
        FROM Insurance_bills b 
        WHERE i.policy_no = b.policy_no
          AND b.paid_date BETWEEN i.due_from_date AND i.due_to_date
          AND MONTH(b.paid_date) = MONTH(CURDATE())
          AND YEAR(b.paid_date) = YEAR(CURDATE())
    );
  `;
  
  dbconn.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err.stack);
      return;
    }
    
    results.forEach(row => {
      sendInsuranceEmail('jebaneshjijin@gmail.com', row.name, row.policy_no, row.amount, row.due_date, row.days_remaining)
        .then(response => {
          console.log('Email sent:', response);
        })
        .catch(error => {
          console.error('Error sending email:', error);
        });
    });
  });
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

console.log('Daily email scheduler started');

app.listen(port, () => {
  logger.info(`Api <Project Name> is listening on ${port}/`);
});
