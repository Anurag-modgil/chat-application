import User from "../models/user.model.js"
import Message from "../models/message.model.js"

export const getUsersForSidebar = async (req, res)=>{
    try{
        const filteredUsers = await User.find({_id: { $ne: req.user._id }}).select("-password");
        return res.status(200).json(filteredUsers);
    }catch(error){
        console.log("Error occured "+error.message);
        return res.status(500).json({message:error.message});
    }
}

export const getMessages = async (req,res)=>{
    try{
        const {id:userToChatWith} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId:myId,
                    receiverId:userToChatWith},
                {senderId:userToChatWith,
                    receiverId:myId}
            ]
        })

        res.status(200).json(messages);
    }catch(error){
        console.log("Error occured in get messages "+error.message)
        res.status(500).json({message:error.message})
    }
}

export const sendMessages = async (req,res)=>{
    try{
        const {id: receiverId} = req.params;
        const {text, image} = req.body;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            imageUrl = uploadResponse.secure_url
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl
        })

        await newMessage.save();

        const receiverSocketId = getSocketIdByUserId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.status(201).json(newMessage);

    }catch(error){
        console.log("Error occured in send messages "+error.message)
        res.status(500).json({message:error.message})
    }
}