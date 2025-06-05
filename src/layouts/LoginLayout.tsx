import type { ReactNode } from "react"

export const AetherLoginLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
            <div className="p-8 bg-white rounded-xl shadow-lg max-w-xl w-full">
                {children}
            </div>
        </div>
    )
}