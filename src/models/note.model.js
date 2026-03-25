import mongoose, {Schema} from "mongoose";
import { title } from "process";


const versionSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    editedBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    editedAt: {
        type: Date,
        default: Date.now
    }
}, {_id: true})




const noteSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    projectId: {
        type: mongoose.Types.ObjectId,
        ref: "Project",
        required: true
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    lastEditedBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    tags: [{
        type: String,
    }],
    isPinned: {
        type: Boolean,
        default: false
    },
    version:{
        type: Number,
        default: 1
    },
    
    versionHistory: [ versionSchema ]
    

}, {timestamps: true})

export const noteTable = mongoose.model("Note", noteSchema)