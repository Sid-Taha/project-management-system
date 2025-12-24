// ------------------------------ User Roles Enum ------------------------------
export const UserRolesEnum = {
    ADMIN: 'admin',
    PROJECT_ADMIN: 'project_admin',
    MEMBER: 'member',
}

export const AvailableUserRole = Object.values(UserRolesEnum);

// ------------------------------ Task Status Enum ------------------------------
export const TaskStatusEnum = {
    TODO: "to_do",
    IN_PROGRESS: "in_progress",
    REVIEW: "review",
    DONE: "done",
}


export const AvailableTaskStatus = Object.values(TaskStatusEnum);