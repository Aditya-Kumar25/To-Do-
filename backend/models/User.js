import mongoose from mongoose

const User =  new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minlenght:2
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        minlength:8
    },
},
    {timestamp:true}
)

export default mongoose.model("User",userSchema);