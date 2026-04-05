const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required : [true,'Name is required'],
        trim:true
    },
    email:{
        type:String,
        required : [true,'Email is required'],
        unique:true,
        lowercase: true,
        trim:true,
        index:true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    password:{
        type:String,
        required : [true,"Password is required"],
        select : false
    },
    role:{
        type:String,
        enum:["viewer","analyst","admin"],
        default:"viewer"
    },
    status:{
        type:String,
        enum:["active","inactive","blocked"],
        default:"active"
    },
    lastLoginAt:{
        type:Date
    }
},{
    timestamps:true
})

module.exports= mongoose.model('User',userSchema);