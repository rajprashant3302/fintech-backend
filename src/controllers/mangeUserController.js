const UserModel = require('../models/userModel');

const blockUser = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await UserModel.findOneAndUpdate(
            { email: email },
            { status: 'inactive' },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User does not exists"
            });
        }

        return res.status(201).json({
            success: true,
            message: "User is blocked",
            data: {
                id: user._id,
                email: user.email,
                status: user.status
            }
        })

    } catch (error) {
        console.error("Error blocking user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

// to get all users - GET /api/admin/all-users?page=1&limit=10
const listUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        console.log(`Fetching Page: ${page}, Limit: ${limit}`);

        if (limit > 20) {
            return res.status(400).json({
                success: false,
                message: "Server can't send more than 20 records at a time."
            });
        }
        const skip = (page - 1) * limit;

        const [users, totalUsers] = await Promise.all([
            UserModel.find().select('name email role status createdAt').skip(skip).limit(limit),
            UserModel.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            data: users,
            message: "All users retrieved successfully",
            pagination: {
                totalUsers: totalUsers,
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit),
                currentItems: users.length
            }
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

// updateRole Patch /api/admin/update-role

const updateRole = async (req,res)=>{
    try {
        const {email,role}=req.body;

        if(!email || !role){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            });
        }

        const allowedRoles = ['viewer', 'analyst', 'admin'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role.`
            });
        }

        const user=await UserModel.findOneAndUpdate(
            {email:email},
            {role:role},
            { returnDocument: 'after' }
        );

        if(!user)
        {
            return res.status(404).json({
                success:false,
                message:"User doesn't exists."
            });
        }

        return res.status(200).json({
            success:true,
            message:"user role updated successfully",
            data:{
                email:user.email,
                userId:user._id,
                role:user.role
            }
        });
        
    } catch (error) {
        console.log("Error in updating role ",error);
        return res.status(500).json(
            {
                error:true,
                message:"Something went wrong"
            }
        );
    }

}

const searchUser = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Search parameter is required."
            });
        }

        const searchRegex = new RegExp(`^${q}`, 'i');

        const users = await UserModel.find({
            $or: [
                { name: { $regex: searchRegex } },
                { email: { $regex: searchRegex } }
            ]
        }).select('name email role status createdAt'); 

        return res.status(200).json({
            success: true,
            message: "Data retrieved successfully!",
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error("Error in searching user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}


module.exports = { blockUser, listUsers,updateRole,searchUser }