const router = require("express").Router();
const User = require("../models/User")
const CryptoJS = require("crypto-js")
const jwt = require("jsonwebtoken")

// Register
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SECRET).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    console.error(err)
    res.status(500).json(err)
  }
});

// Login
router.post("/login", async (req, res) => {

  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      res.status(401).json("Wrong username!");
    } else {
      const hashedPass = CryptoJS.AES.decrypt(user.password, process.env.PASS_SECRET);
      const originalPass = hashedPass.toString(CryptoJS.enc.Utf8);

      let inputPass = req.body.password;

      if (originalPass !== inputPass) {
        res.status(401).json("Wrong password!");
      } else {
        const accessToken = jwt.sign({
          id: user._id,
          isAdmin: user.isAdmin,
        },
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
        );

        const { password, ...others } = user._doc;
        res.status(200).json({...others, accessToken});
      }
    }
  } catch (err) {
    res.status(500).json(err)
  }
});


module.exports = router;