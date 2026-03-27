import { asyncHandler } from "../utils/async-handler";
import openai from "../config/openai.js"
import { projectTable } from "../models/project.models.js";
import { tableTask } from "../models/task.model.js";
import {projectMember} from "../models/projectMemberRole.model.js"

const askAI = async (systemPrompt, userPrompt) => {
    
    const response = await openai.responses.create({
        model: "gpt-4.1-mini",
        input: userPrompt,
        instructions: systemPrompt,
        temperature: 0.7, // Adjust the creativity of the response
    });

    const content = response.output_text;

    return  {
        result: JSON.parse(content),
        metaData: {
            processingTime: Date.now(),
        }
    }

}







export const suggestTasks = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    if(!projectId) return res.status(400).json({ error: "Project ID is required" })

    const {context, count, includeSubtasks} = req.body
    if(!context) return res.status(400).json({ error: "Context is required" })

    const project = await projectTable.findById(projectId)
    if(!project) return res.status(404).json({ error: "Project not found" })

    // get existing tasks of this project
    const existingTasks = await tableTask.find({project: projectId}).limit(20)

    // get team members of this project
    const members = await projectMember.find({project: projectId})

    // prepare system prompt for AI
    const sysPrompt = `you are a project management AI assistant.
    your job is to suggest relevant task for software projects.
    always respond in JSON format only.`

    // prepare user prompt for AI
    const usrPrompt =  `
    project name: ${project.name}
    project context: ${context}
    team size: ${members.length} members
    team members: ${members.map(m => m.user).join(", ")}

    existing tasks(avoid duplicates): ${existingTasks.map(t => t.title).join(", ")}

    generate ${count || 5} task suggestions${includeSubtasks ? "with subtasks" : ""}.

    respond with this exact JSON format:
    {
        suggestions: [
            {
                title: "task title",
                description: "task description",
                "priority": "low/medium/high/critical",
                "estimatedHours": number,
                "suggestedTags: ["tag1", "tag2"],
                "subtasks": [ "subtask1", "subtask2" ], // if includeSubtasks is true
                "dependencies": ["existing task1", "existing task2"] // if any
            }
        ],

        "reasoning": "why these tasks were suggested, explain your reasoning here in detail",

        "estimatedTotalTime": "x hours",

        "confidence" : 0.0 to 1.0 // how confident are you about these suggestions, 1.0 means very confident, 0.0 means not confident at all

    }
    `

    const startTime = Date.now()
    const {result, metaData} = await askAI(sysPrompt, usrPrompt)
    metaData.processingTime = Date.now() - startTime

    return res.status(200).json(new ApiResponse(200, {...result, metaData}, "Task suggestions generated successfully"))
})