export interface CallLogDetails {
  id: string,
  user_id: string,
  device_id: string,
  device_call_log_id: number,
  direction: string,
  status: string,
  duration: number,
  type: string,
  start_time: string,
  other_number: string,
  other_name: string,
  agent_number: string,
  created_at: string
  recording_ids: string[]
}
export interface FilterState {
  otherName: string[]
  otherNumber: string[]
  agentNumber: string[]
  direction: string[]
  callstatus: string[]
  typecall: string[]
}


export const filters = {
  user_id: "",
  device_id: "",
  direction: "",
  status: "",
  duration: "",
  start_time: "",
  other_number: "",
  other_name: "",
  agent_number: ""
};