const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  //look at the request's headers to see if there is a token
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    //we are not authenticated, but it 
    //doesn't mean user is blocked from ALL rsources
    //** WE CAN LET THE REQ PASS, 
    //**but with an identifier of isAuth = false */
    //we made up the name isAuth
    req.isAuth = false;
    return next();
  }
  //at this point
  //we atleast have Authorization Header, 
  //but not mean there is valid token
  const token = authHeader.split(" ")[1]; //Bearer skdfhasidzasd
  if (!token || token === "") {
    req.isAuth = false;
    return next();
  }
  //at this point
  //we have token?? lets verify
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "somesupersecretkey");
  }catch(err) {
    req.isAuth = false;
    return next();
  }
  //check if it's really set
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  //SUCCESS !!
  req.isAuth = true;
  req.userId = decodedToken.userId;
  next();
}