require("dotenv").config();
const { sequelize } = require("./config/db");

const makeAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected!");
    
    const [results] = await sequelize.query(
      "UPDATE Users SET role = 'admin' WHERE id = 1"
    );
    console.log("Done!", results);
    
    const [users] = await sequelize.query(
      "SELECT id, name, email, role FROM Users WHERE id = 1"
    );
    console.log("User now:", users);
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

makeAdmin();