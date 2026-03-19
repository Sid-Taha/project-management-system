import mongoose, {Schema} from "mongoose";
import { title } from "process";

const subtaskSchema = new Schema({
    title: {
        type: String,
        required: [true, "Subtask title is required"],
        trim: true,
        maxlength: [100, "Subtask title must be less than 100 characters"]
    },

    task : {
        type: Schema.Types.ObjectId,
        ref: "task",
        required: [true, "Task reference is required for subtask"]
    },

    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: [true, "Project reference is required for subtask"]
    },

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Creator reference is required for subtask"]
    },

    isCompleted: {
        type: Boolean,
        default: false
    },

    completeAt: {
        type: Date,
        default: null
    },

    completedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }

}, {timestamps: true})

export const subtaskTable = mongoose.model("subtask", subtaskSchema)