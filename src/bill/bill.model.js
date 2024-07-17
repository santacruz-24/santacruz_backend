"use strict";
const db = require("../../config/db.config");



const Bill = {
  add_cc_bill: (newData) => {
    const { bank_name, cc_no, due_date, amount } = newData;

    const query =
      "INSERT INTO Credit_card_bills (bank_name, cc_no, due_date, amount, status) VALUES (?, ?, ?, ?, ?)";

    const status = 'active'; // Assuming 'active' is the default status

    return new Promise((resolve, reject) => {
      db.query(query, [bank_name, cc_no, due_date, amount, status], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  add_insurance_bill: (newData) => {
    const { name, policy_no, due_from_date, due_to_date, amount } = newData;

    const query =
      "INSERT INTO Insurance (name, policy_no, due_from_date, due_to_date, amount, status) VALUES (?, ?, ?, ?, ?, ?)";

    const status = 'active'; // Assuming 'active' is the default status

    return new Promise((resolve, reject) => {
      db.query(query, [name, policy_no, due_from_date, due_to_date, amount, status], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  add_house_hold_bill: (newData) => {
    const { grocery, electricity, water, gas, internet, others, date, total_amount } = newData;

    const query =
      "INSERT INTO house_hold_expenses (grocery, electricity, water, gas, internet, others, date, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    return new Promise((resolve, reject) => {
      db.query(query, [grocery, electricity, water, gas, internet, others, date, total_amount], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },
  get_insurance_bill_Info: () => {
    const query =
      "SELECT id, name, policy_no, status, due_from_date, due_to_date, amount FROM Insurance";
    return new Promise((resolve, reject) => {
      db.query(query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },
  insertInsuranceBill: (billId, amount, name) => {
    const currentDateTime = new Date();
    const query = "INSERT INTO Insurance_bills (paid_date, policy_no, amount, name) VALUES (?, ?, ?, ?)";
  
    return new Promise((resolve, reject) => {
      db.query(query, [currentDateTime, billId, amount, name], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },
  get_CC_bill_Info: () => {
    const query =
      "SELECT id, bank_name, cc_no, status, due_date, amount FROM Credit_card_bills";
    return new Promise((resolve, reject) => {
      db.query(query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },
  get_paid_CC_bill_Info: () => {
    const query =
      "SELECT id, bank_name, cc_no, status, due_date, amount, deleted_at FROM Credit_card_bills WHERE status = 'deactive'";
    return new Promise((resolve, reject) => {
      db.query(query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

 getExpenseInfo : async (date) => {
    const month = new Date(date).getMonth() + 1; // Extract the month from the date
    const year = new Date(date).getFullYear(); // Extract the year from the date
    const yearMonth = year * 100 + month; // combine year and month to format YYYYMM
  
    const CC_Query = `
      SELECT SUM(amount) AS total_amount 
      FROM Credit_card_bills 
      WHERE MONTH(due_date) = ? 
        AND YEAR(due_date) = ? 
        AND status = 'deactive'
    `;
  
    const Insurance_Query = `
      SELECT SUM(amount) AS total_amount 
      FROM Insurance_bills 
      WHERE Month(paid_date) = ? 
        AND Year(paid_date) = ? 
    `;
  
    const Water_Query = `
      SELECT SUM(water) AS total_amount 
      FROM house_hold_expenses 
      WHERE MONTH(date) = ? 
        AND YEAR(date) = ? 
    `;
  
    const Gas_Query = `
      SELECT SUM(gas) AS total_amount 
      FROM house_hold_expenses 
      WHERE MONTH(date) = ? 
        AND YEAR(date) = ? 
    `;
  
    const Electricity_Query = `
      SELECT SUM(electricity) AS total_amount 
      FROM house_hold_expenses 
      WHERE MONTH(date) = ? 
        AND YEAR(date) = ? 
    `;
  
    const Internet_Query = `
      SELECT SUM(internet) AS total_amount 
      FROM house_hold_expenses 
      WHERE MONTH(date) = ? 
        AND YEAR(date) = ? 
    `;
  
    const Grocery_Query = `
      SELECT SUM(grocery) AS total_amount 
      FROM house_hold_expenses 
      WHERE MONTH(date) = ? 
        AND YEAR(date) = ? 
    `;
  
    const Others_Query = `
      SELECT SUM(others) AS total_amount 
      FROM house_hold_expenses 
      WHERE MONTH(date) = ? 
        AND YEAR(date) = ? 
    `;
  
    const House_Query = `
      SELECT SUM(total_amount) AS total_amount 
      FROM house_hold_expenses 
      WHERE MONTH(date) = ? 
        AND YEAR(date) = ? 
    `;
  
    const queryPromise = (query, params) => {
      return new Promise((resolve, reject) => {
        db.query(query, params, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result[0].total_amount || 0); // Return 0 if result is null or undefined
          }
        });
      });
    };
  
    try {
      const [
        ccAmount,
        insuranceAmount,
        waterAmount,
        gasAmount,
        electricityAmount,
        internetAmount,
        groceryAmount,
        othersAmount,
        houseAmount
      ] = await Promise.all([
        queryPromise(CC_Query, [month, year]),
        queryPromise(Insurance_Query, [month, year]),
        queryPromise(Water_Query, [month, year]),
        queryPromise(Gas_Query, [month, year]),
        queryPromise(Electricity_Query, [month, year]),
        queryPromise(Internet_Query, [month, year]),
        queryPromise(Grocery_Query, [month, year]),
        queryPromise(Others_Query, [month, year]),
        queryPromise(House_Query, [month, year])
      ]);
  
      return {
        creditCard: ccAmount,
        insurance: insuranceAmount,
        water: waterAmount,
        gas: gasAmount,
        electricity: electricityAmount,
        internet: internetAmount,
        grocery: groceryAmount,
        others: othersAmount,
        houseExpenses: houseAmount,
        totalAmount: ccAmount + insuranceAmount + houseAmount
      };
    } catch (error) {
      throw error;
    }
  },

  delete_CC_bill : (billId) => {
    const currentDateTime = new Date();
    const query = "UPDATE Credit_card_bills SET status='deactive', deleted_at=? WHERE id = ?";
  
    return new Promise((resolve, reject) => {
      db.query(query, [currentDateTime, billId], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },  
  // get_paid_Insurance_bill_Info: () => {
  //   const query = "SELECT id, policy_no, paid_date, amount FROM Insurance_bills";
  //   return new Promise((resolve, reject) => {
  //     db.query(query, (err, result) => {
  //       if (err) {
  //         reject(err);
  //       } else {
  //         resolve(result);
  //       }
  //     });
  //   });
  // },
  getpaidInsuranceBillInfo: () => {
    const query = `
SELECT ib.policy_no, ib.id AS bill_id, ib.paid_date, ib.amount, ib.name
FROM Insurance_bills ib
 `;
  
    return new Promise((resolve, reject) => {
      db.query(query, (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },  
};

module.exports = Bill;
