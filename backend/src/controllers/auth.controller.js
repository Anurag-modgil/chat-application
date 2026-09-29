import bcrypt from "bcryptjs";
import User from "../models/user.model.js"
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";



export const signup = async (req,res)=>{
    const {fullName,password,email} = req.body;
    try{
        if(!password || !email || !fullName){
            return res.status(400).json({message : "All Fields are required"});
        }
        if(password.length < 6){
            return res.status(400).json({message : "password should be atleast 6 character long"});
        }else{
            const user = await User.findOne({email});
            if(user){
                return res.status(400).json({message : "User already exists"});
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password,salt);

            const newUser = new User({
                email : email,
                fullName:fullName,
                password:hashedPassword
            })

            if(newUser){
                generateToken(newUser._id,res);
                await newUser.save();
                return res.status(200).json({
                    _id : newUser._id,
                    email : newUser.email,
                    fullName: newUser.fullName,
                    profilePic : newUser.profilePic
                });
            }else{
                return res.status(400).json({message : "Invalid user details"});
            }
            

        }

    }catch(error){
        console.log("Error occured in signup method");
        res.status(500).json({
        message: error.message
        });
    }
}


export const login = async (req,res)=>{
    const {email,password} = req.body;
    try{
        if(!password || !email){
            return res.status(400).json({message : "All Fields are required"});
        }if(password.length < 6){
            return res.status(400).json({message : "password should be atleast 6 character long"});
        }else{
            const user = await User.findOne({email});
            if (!user) {
                return res.status(400).json({
                    message: "Invalid credentials"
                });
            }
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(400).json({
                    message: "Invalid credentials"
                });
            }
            generateToken(user._id, res);
            return res.status(200).json({
                __filenameid: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic : user.profilePic
            });

        }

    }catch(error){
        console.log("Error occured in signup method");
        res.status(500).json({
        message: error.message
        });
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {
            maxAge: 0,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });

        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message,
        });
    }
};


export const updateProfile = async (req,res) =>{
    try{
        const {profilePic} = req.body;
        const userId = req.body._id;

        if(!profilePic){
            return res.status(400).json({message:"Profile picture is required"})
        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedDB = await User.findOneAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true});

        return res.status(200).json(updatedDB)
    }catch(error){
        console.log("Error occured in update profile method " +error.message );
        return res.status(500).json({message:error.message});
    }
}

export const checkAuth =  (req,res) =>{
    try{
        return res.status(200).json(req.user);
    }catch(error){
        console.log("Error in checkAuth method "+error.message)
        res.status(500).json({message:error.message})
    }
}