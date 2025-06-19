import type { ReactNode } from "react"
import SignUpBackgroud from "../assets/initload.svg";

export const AehterOnBoardLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="min-h-screen grid grid-cols-2 bg-white">
            <div className="flex items-center justify-center bg-white p-6">
                <div className="w-full max-w-md">
                    <img src={SignUpBackgroud} alt="isignup image" />
                </div>
            </div>
            <div className="flex items-center justify-center bg-white p-6">
                <div className="w-full max-w-md bg-white rounded-2xl py-10 px-5">
                    {children}
                </div>
            </div>
        </div>
    )
}