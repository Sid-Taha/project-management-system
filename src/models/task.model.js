import mongoose, {Schema} from "mongoose";

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [200, "Title must be less than 200 characters"],
    },

    description: {
        type: String,
        trim: true,
        maxlength: [2000, "Description must be less than 2000 characters"],
    },

    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true
    },

    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    assignedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    status: {
        type: String,
        enum: ["todo", "in-progress", "done"],
        default: "todo",
        index: true
    },

    priority: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "medium",
        index: true
    },

    dueDate: {
        type: Date,
        default: null,
        index: true
    },

    estimatedHours: {
        type: Number,
        min: [0, "Estimated hours must be a positive number"],
        default: null
    },

    actualHours: {
        type: Number,
        min: [0, "Actual hours must be a positive number"],
        default: null
    },

    tags: [{
        type: String,
        trim: true,
        maxlength: [50, "Tag must be less than 50 characters"]
    }],

    attachments: [{
        filename: {
            type: String,
            trim: true,
            maxlength: [200, "Filename must be less than 200 characters"]
        },
        path: {
            type: String,
            trim: true,
            maxlength: [500, "Path must be less than 500 characters"]
        }
    }],


}, {timestamps: true})

export const tableTask = mongoose.model("task", taskSchema)