export interface UserLoginPayload {
    client_type?: 'console' | 'agent' | 'superconsole'
    client_key?: string
    device_id?: string
    phone_number?: string
    otp_jwt?: string
    password?: string
}

export interface UserLoginResponse {
  access_token:string
  refresh_token: string
}