import mongoose from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt";

export interface UserDocument extends mongoose.Document {
    email:string,
    username:string,
    password:string,
    verified:boolean,
    qrCode: string,
    referredBy:string,
    rewardPoints:Number,
    rewardCount:Number,
    createdAt:Date,
    updatedAt:Date,
    __v?:number,
    comparePassword(val:string):Promise<boolean>;
    omitPassword(): Pick<UserDocument, "_id" | "email" | "verified" | "createdAt" | "updatedAt" | "__v">
}

const userSchema = new mongoose.Schema<UserDocument>({
    email:{
        type:String,
        unique:true,
        required:true,
    },
    username:{
        type:String,
        unique:true,
        required:true,
    },
    password:{
        type:String,
        unique:true,
        required:true,
    },
    verified:{
        type:Boolean,
        required:true,
        default:false
    },
    qrCode:{
        type:String,
        unique:true,
        default:null,
      },
      referredBy:{
        type:String,
        defaukt:null,
      },
      rewardPoints:{
        type:Number,
        default:0,
      },
      rewardCount:{
        type:Number,
        default:0,
      },

},{
    timestamps:true,
})

//Schema Hooks
userSchema.pre("save", async function (next){
    if (!this.isModified("password")){
        return next();
    }
    // this.password = await bcryptjs.hash(this.password, 8)
    this.password = await hashValue(this.password);
    next();
})

userSchema.methods.comparePassword = async function (val: string ){
    return compareValue(val, this.password);
}

userSchema.methods.omitPassword = function (){
    const user = this.toObject();
    delete user.password;
    return user;
}

const UserModel = mongoose.model("User", userSchema);
export default UserModel