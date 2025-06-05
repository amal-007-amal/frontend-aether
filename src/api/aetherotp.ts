// src/api/msg91.ts
import axios from "axios"

const MSG91_AUTHKEY = "YOUR_AUTH_KEY"  
const TEMPLATE_ID = "YOUR_TEMPLATE_ID"
const SENDER_ID = "YOUR_SENDER_ID"

export const sendOtp = async (phone: string) => {
  return axios.get("https://control.msg91.com/api/v5/otp", {
    params: {
      authkey: MSG91_AUTHKEY,
      mobile: `91${phone}`,
      template_id: TEMPLATE_ID,
      sender: SENDER_ID,
    },
  })
}

export const verifyOtp = async (phone: string, otp: string) => {
  return axios.get("https://control.msg91.com/api/v5/otp/verify", {
    params: {
      authkey: MSG91_AUTHKEY,
      mobile: `91${phone}`,
      otp,
    },
  })
}
