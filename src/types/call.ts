export interface CallLogDetails {
    id: string,
    user_id: string,
    device_id: string,
    device_call_log_id: number,
    type: string,
    duration: number,
    start_time: string,
    other_number: string,
    other_name: string,
    agent_number: string,
    created_at: string
}