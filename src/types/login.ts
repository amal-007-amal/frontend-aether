export interface UserLoginPayload {
  client_type?: 'console' | 'agent' | 'superconsole'
  client_key?: string
  device_id?: string
  phone_number?: string
  otp_jwt?: string
  password?: string
}

export interface UserLoginResponse {
  access_token: string
  refresh_token: string
}

export interface User {
  id: string,
  phone_number: string,
  name: string,
  latest_agent_device_id: string,
  latest_console_device_id: string,
  has_console_access: boolean,
  has_agent_access: boolean,
  is_superuser: boolean
}

export interface CreateUser {
  phone_number: string,
  name: string,
  latest_mobile_device_id: string,
  has_console_access: boolean,
  has_agent_access: boolean,
  is_superuser: boolean
}