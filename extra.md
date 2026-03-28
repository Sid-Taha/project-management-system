{
    "statusCode": 200,
    "data": {
        "overallRisk": "medium",
        "healthScore": 60,
        "risks": [
            {
                "category": "resource",
                "severity": "medium",
                "title": "Undefined team member workload",
                "description": "Two active tasks are assigned to an undefined team member, which indicates lack of clear resource allocation and potential accountability issues.",
                "recommendation": "Clearly assign tasks to specific team members and ensure workload is balanced to improve accountability and performance tracking.",
                "impact": "Lack of clear resource assignment can lead to delays, miscommunication, and reduced productivity."
            },
            {
                "category": "schedule",
                "severity": "medium",
                "title": "Low task completion rate",
                "description": "Out of two total tasks, none have been completed and only one is in progress, indicating slow progress.",
                "recommendation": "Review task dependencies and blockers, set achievable milestones, and monitor progress closely to improve task completion rate.",
                "impact": "Delayed task completion may push back project deadlines and affect overall delivery."
            }
        ],
        "positives": [
            "No overdue tasks currently, indicating some level of schedule adherence.",
            "At least one task is actively in progress, showing ongoing work."
        ],
        "summary": "The backend project shows medium risk primarily due to unclear resource allocation and slow task completion. While no tasks are overdue, the lack of completed tasks and undefined team member assignments could lead to schedule delays and accountability issues. Addressing resource clarity and improving task progress tracking are key to enhancing project health.",
        "metaData": {
            "processingTime": 5824
        }
    },
    "message": "Project risk analysis generated successfully",
    "success": true
}