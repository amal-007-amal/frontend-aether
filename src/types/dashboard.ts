export interface Callactivity {
    total_calls: number,
    incoming_calls: number,
    outgoing_calls: number,
    missed_calls: number,
    not_connected_calls: number,
    abandoned_numbers: number
}
export interface LeaderBoard {
    user_id: string,
    user_name: string,
    all_calls: number,
    all_calls_rank: number,
    connected_calls: number,
    connected_calls_rank: number,
    total_call_duration: number,
    call_duration_rank: number
}

export interface ActiveHour {
  hour_range: string;
  incoming_connected: number;
  incoming_not_connected: number;
  outgoing_connected: number;
  outgoing_not_connected: number;
}