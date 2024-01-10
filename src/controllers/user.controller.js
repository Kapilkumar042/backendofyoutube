import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

//generating access and refresh token
const generateAccessAndrefreshToken = async (UserId)=>{
   try {
      const user = await User.findById(UserId)

     const accessToken= await user.generateAccessToken() 
     const refreshToken = await user.generateRefreshToken()
     user.refreshToken=refreshToken
     await user.save({ validateBeforeSave:false })

     return {refreshToken, accessToken}
   } catch (error) {
      throw new ApiError(500, "Somethings went wrong while generating refresh and access token ")
   }
}

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

//login

const loginUser= asyncHandler (async(req,res)=>{
   //user ki email or username lege from frontend
   //check fields empty
   //check user exists or not
   //password check
   //generate access and refresh token
   //send cookie

   const {email, username, password} = req.body;

   if(!username || !email){
      throw new ApiError(400,"username or email is required")
   }

   const user=await User.findOne({
      $or:[{username},{email}]
   })

   if(!user){
      throw new ApiError(404,"user not register with this email or username")
   }
  
   const isPasswordValid = await user.isPasswordCorrect(password)

   if(!isPasswordValid){
      throw new ApiError(401,"Invalid user credentials")
   }

   const {accessToken, refreshToken}=await generateAccessAndrefreshToken(user._id)

   const loginedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options={
      httpOnly:true,
      secure:true
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
      new ApiResponse(200,{
         user:loginedInUser, accessToken, refreshToken
      },
      "user logged in successully"
      )
   )

})

const logoutUser = asyncHandler (async(req,res)=>{
   await User.findByIdAndUpdate(
      req.user._id,{
         $set:{
            refreshToken:undefined
         }
      } ,
      {
         new:true
      }
   )

   const options={
      httpOnly:true,
      secure:true
   }
   return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken",options)
   .json( new ApiResponse(200,{},"user logged out"))
})


export  {registerUser,loginUser, logoutUser}