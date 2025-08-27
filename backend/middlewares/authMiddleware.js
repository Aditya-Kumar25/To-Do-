import jwt from "jsonwebtoken";

export const authMiddleware = (req,res,next)=>{
    const token = req.header("Authorization")?.replace("Bearer","");

    if(!token){
        return res.status(401).json({msg:"No token, No Authorization"});
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET);

     req.user = decoded;

     next();
}