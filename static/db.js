const mongoose = require("mongoose");
const connectdb = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, () =>
      console.log("Connection Successful")
    );
  } catch (error) {
    console.log(`Error : ${error.message}`);
    process.exit();
  }
};
// const func = () => {
//   mongoose
//     .connect(process.env.MONGO_URI)
//     .then(() => console.log("Connection SuccessFul"))
//     .catch((err) => console.log(err));
// };

module.exports = connectdb;
