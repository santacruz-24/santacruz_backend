const billModel = require("./bill.model");
const logger = require("../../logger");

const handleServerError = (res, error) => {
  logger.error(`Error: ${error.message}`);
  res.status(500).json({ message: "Internal Server Error" });
};

const billController = {
  add_cc_bill: async (req, res) => {
    logger.info("Adding credit card bill");
    const newData = req.body;
    try {
      await billModel.add_cc_bill(newData);
      res.status(200).json({ message: "Credit card bill added successfully" });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  add_insurance_bill: async (req, res) => {
    logger.info("Adding insurance bill");
    const newData = req.body;
    try {
      await billModel.add_insurance_bill(newData);
      res.status(200).json({ message: "Insurance bill added successfully" });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  add_house_hold_bill: async (req, res) => {
    logger.info("Adding house hold bill");
    const newData = req.body;
    try {
      await billModel.add_house_hold_bill(newData);
      res.status(200).json({ message: "House hold bill added successfully" });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  getExpenseInfo: async (req, res) => {
    const date = req.query.date;
    logger.info(`Fetching expense info for date: ${date}`);
    try {
      const expenseInfo = await billModel.getExpenseInfo(date);
      res.status(200).json(expenseInfo);
    } catch (error) {
      handleServerError(res, error);
    }
  },
  get_CC_bill_Info: async (req, res) => {
    try {
      const billinfo = await billModel.get_CC_bill_Info();
      res.status(200).json(billinfo);
    } catch (error) {
      console.log(error);
      logger.error(`Error viewing user: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  get_insurance_bill_Info: async (req, res) => {
    try {
      const billinfo = await billModel.get_insurance_bill_Info();
      res.status(200).json(billinfo);
    } catch (error) {
      console.log(error);
      logger.error(`Error viewing user: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  get_paid_CC_bill_Info: async (req, res) => {
    try {
      const billinfo = await billModel.get_paid_CC_bill_Info();
      res.status(200).json(billinfo);
    } catch (error) {
      console.log(error);
      logger.error(`Error viewing user: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  delete_CC_bill : async (req, res) => {
    const billId = req.params.id;
    try {
      const billInfo = await billModel.delete_CC_bill(billId);
      res.status(200).json(billInfo);
    } catch (error) {
      console.log(error);
      logger.error(`Error deleting bill: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
  Pay_Insurance_bill: async (req, res) => {
    const billId = req.params.id;
    const { amount, name } = req.body;
  
    try {
      const billInfo = await billModel.insertInsuranceBill(billId, amount, name);
      res.status(200).json(billInfo);
    } catch (error) {
      console.error(error);
      logger.error(`Error paying insurance bill: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" }); 
    }
  },  
  // get_paid_Insurance_bill_Info: async (req, res) => {
  //   try {
  //     const billinfo = await billModel.get_paid_Insurance_bill_Info();
  //     res.status(200).json(billinfo);
  //   } catch (error) {
  //     console.log(error);
  //     logger.error(`Error viewing user: ${error.message}`);
  //     res.status(500).json({ message: "Internal Server Error" });
  //   }
  // },
  get_paid_insurance_bill_Info: async (req, res) => {
    try {
      const billinfo = await billModel.getpaidInsuranceBillInfo();
      res.status(200).json(billinfo);
    } catch (error) {
      console.log(error);
      logger.error(`Error viewing user: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

module.exports = billController;
