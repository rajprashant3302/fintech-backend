require("dotenv").config();

const mongoose =require('mongoose');
const connectMongoDB = async ()=>{
    try {
        const uri = process.env.MONGODB_URI;
        console.log(`MONGODB_URI : ${uri}`);

        if(!uri){
            console.log("MongoDB_URI is missing.");
        }

        await mongoose.connect(uri);
        const connection= mongoose.connection;

        connection.on('connected',()=>{
            console.log("✅MongoDB Connected Successfully !");
        });

        connection.on('error',(err)=>{
            console.log(`❌MongoDB connection Error ! ${err}`);
        });

        console.log("MongoDB Setup Complete !");
    } catch (error) {
        console.log(`❌ MongoDB connection Error ! ${error}`);
        process.exit(1);
    }
}

module.exports=connectMongoDB;