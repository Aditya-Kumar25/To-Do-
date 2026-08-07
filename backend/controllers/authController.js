import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//  SIGNUP
export const signup = async(req,res)=>{
    try{
        const {name,email,password} = req.body;

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({msg:"User already exists"});
        }

        if (!password || password.length < 8) {
            return res.status(400).json({ msg: "Password must be at least 8 characters long" });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = new User({
            name,email,password:hashedPassword
        });

        await newUser.save();

        res.status(201).json({msg:"User registered successfully"});
    }
    catch(err){
        res.status(500).json({msg:err.message});
    }
}
    // LOGIN

    export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000 // 1 hour
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req,res)=>{
    const user = await User.findById(req.user.id).select("-password");
    if(!user){
        return res.status(404).json({msg:"Maujood nahi hai"});
    }
    res.json(user);

}

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ isAuthenticated: false, message: "User not found" });
    }
    res.json({ isAuthenticated: true, user });
  } catch (err) {
    res.status(500).json({ isAuthenticated: false, message: err.message });
  }
};