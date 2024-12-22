import mongoose from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt";

export interface UserDocument extends mongoose.Document {
    email:string,
    password:string,
    verified:boolean,
    createdAt:Date,
    updatedAt:Date,
    __v?:number,
    wallet?: mongoose.Types.ObjectId,
    comparePassword(val:string):Promise<boolean>;
    omitPassword(): Pick<UserDocument, "_id" | "email" | "verified" | "createdAt" | "updatedAt" | "__v">
}

const userSchema = new mongoose.Schema<UserDocument>({
    /** include stripe accountId field
     we need to handle login email and paypal email to avoid error 
     if user wants to withdraw  through paypal
     **/
    email:{
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
    // Reference to the Wallet model (one-to-one relationship)
    // wallet:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Wallet",
    //     required: true,
    // },

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