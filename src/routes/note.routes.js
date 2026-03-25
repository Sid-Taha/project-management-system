import express from 'express';
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {createNote, listNotes, updateNote, deleteNote} from "../controllers/note.controllers.js"
import {requireProjectMember} from "../middlewares/project.middleware.js"

const router = express.Router();

router.use(verifyJWT)

router.route("/:projectId").all(requireProjectMember).post(createNote)

router.route("/:projectId").all(requireProjectMember).get(listNotes)

router.route("/:projectId/:noteId").all(requireProjectMember).put(updateNote)

router.route("/:projectId/:noteId").all(requireProjectMember).delete(deleteNote)



export default router;