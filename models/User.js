// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   isVerified: {
//     type: Boolean,
//     default: false,
//   },
//   verificationToken: {
//     type: String,
//   },
// });

// module.exports = mongoose.model("User", UserSchema);
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String, // Adjust the type if you need a specific format
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  // age: {
  //   type: Number,
  //   required: true,
  // },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String, // Consider using an ENUM if you have specific options
    required: true,
  },
  userRole: {
    type: String, // Consider using an ENUM if you have specific options
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  manualVerification: {
    type: Boolean,
    default: false,
  },
});


UserSchema.statics.findById = function (id) {
  if (!mongoose.Types.ObjectId.isValid('674d912a70be5129a417a72d')) {
    throw new Error('Invalid ObjectId format');
  }
  else
  {
    return this.findOne({ _id: new mongoose.Types.ObjectId(id) });
  }
  
};

module.exports = mongoose.model("User", UserSchema);
