import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
const registerUser = asyncHandler (async(req,res)=>{
     // get user details from frontend 
     //validation - not empty
     //check if user already exists: username email
     //check for images, check for avatar
     //upload them to cloudinary, avatar
     //create user object -create entry in db
     //remove password and refresh token field from response
     //check for creation 
     //return res

     const {fullName, email, username, password} = req.body;
     console.log("email: ",email);

     if(
        [fullName, email, username, password].some((field)=>
        field?.trim()==="")
     ){
        throw ApiError(400,"All Fields are required")
     }

     const exisredUser=await User.findOne({
        $or:[{email},{username}]
     })

     if(exisredUser){
        throw new ApiError(409, "User with email or username already exists")
     }

     const avatarLocalPath=req.files?.avatar[0]?.path;

    //  const coverImageLocalPath=req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage)&&req.files.coverImage.lenght>0){
        coverImageLocalPath=req.files.coverImage[0].path;
    }

     if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is ddd required")
     }

     const avatar= await uploadOnCloudinary(avatarLocalPath)
     const coverImage= await uploadOnCloudinary(coverImageLocalPath)

     if(!avatar){
        throw new ApiError(400,"Avatar file is sss required")
     }

     const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
     })

     const createduser=await User.findById(user._id).select("-password -refreshToken")

     if(!createduser){
        throw new ApiError(500,"Somethings went wront while registering user");
     }

     return res.status(201).json(
        new ApiResponse(200, createduser, "User register successfully")
     )

    //  if(fullName===""){
    //     throw new ApiError(400,"fullname is required")
    //  }
})  


export  {registerUser}