const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

//import the model
const User = require("../../models/user");

//used as rootValue in app.js
module.exports = {
  createUser: async (args) => {
    try {
      //first look for user with same email address
      const existingUser = await User.findOne({email: args.userInput.email})
      //means user already exists in DB. 
      if(existingUser) {
        throw new Error("User exists already.")
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password,12)
      const user = new User({
        email:args.userInput.email,
        password: hashedPassword
      });
      const result = await user.save();
      return {...result._doc, password: null}
    }catch(err) {
      throw err;
    }
  },
  login: async ({email, password}) => {
    //does user exist
    const user = await User.findOne({email: email});
    if (!user) {
      throw new Error("User does not exist")
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if(!isEqual) {
      //user exists, but entered password is incorrect
      throw new Error("Password is incorrect!");
    }
    // we know we have a user and password is correct
    const token = jwt.sign(
      {
        userId: user.id, //.id is a getter to give id not wrapped in ObjectId
        email: user.email
      },
      'somesupersecretkey', //used to hash the token. later used to validate the token
      {
        expiresIn: '1h'
      }
    );
    return {
      userId: user.id,
      token: token,
      tokenExpiration: 1
    }
  }
}