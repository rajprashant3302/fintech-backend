const UserModel = require('../models/userModel');
const bcrypt = require("bcrypt");
const generateToken = require('../utils/generateToken')

//register - /api/auth/register
exports.registerUser = async(req,res)=>{
    try {
        const {name , email ,password,role} = req.body;
        // console.log("BODY:", req.body);
        if(!name || !email || !password)
        {
            return res.status(400).json({success:false,message:"All Fields are required"});
        }


            if(role && role!='viewer' && role!='analyst' &&  role!='admin')
            {
                return res.status(400).json({success:false,message:"Invalid Role"});
            }

        const existingUser = await UserModel.findOne({email:email});

        if(existingUser)
        {
            return res.status(400).json({success:false,message:"User already exists !"});
        }
        const hashPassword = await bcrypt.hash(password,10);
        const user=await UserModel.create({
            name,
            email,
            password:hashPassword,
            role:role || 'viewer'
        });
        return res.status(201).json({
            success:true,
            message:"User registered Successfully !",
            user :{
                email:user.email,
                name: user.name,
                role:user.role
            }
        });
    } catch (error) {
        console.log("Server Not responding ",error);
        return res.status(500).json({error:true,message:"Internal Server Error"});
    }
}

//login - /api/auth/login
exports.loginUser = async(req,res)=>{
    try {
        const { email ,password} = req.body;
        if(!email || !password)
        {
            return res.status(400).json({success:false,message:"All Fields are required"});
        }



        const user = await UserModel.findOne({email:email}).select('+password');

        if(!user)
        {
            return res.status(400).json({success:false,message:"Invalid credential!"});
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if(!isPasswordMatch)
        {
            return res.status(400).json({success:false,message:"Invalid credential!"});
        }

        if(user.status =='inactive')
        {
            return res.status(403).json({
                success:false,
                message:"Your account has been blocked by admin."
            })
        }

        const token=generateToken(user._id , user.role);

        return res.status(201).json({
            success:true,
            message:"login Successfully !",
            token,
            user:{
                id: user._id,
                name:user.name,
                email:user.email,
                role:user.role
            }
        });
    } catch (error) {
        console.log("Server Not responding ",error);
        return res.status(500).json({error:true,message:"Internal Server Error"});
    }
}