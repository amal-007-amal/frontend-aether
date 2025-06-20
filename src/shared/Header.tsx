import { AudioLines, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function Header() {
    const aetherNaviagte =  useNavigate()
    const handleLogout = () =>{
        localStorage.removeItem('aether_access_token')
        localStorage.removeItem('aether_refresh_token')
        aetherNaviagte('/')
    }
    return (
        <header className="bg-purple-100 text-white p-4 border-b border-b-gray-300 flex justify-between items-center">
            <h2 className="font-light flex text-black text-xl items-center">
                A<span className="text-purple-500">ether</span>&nbsp;Hub&nbsp;
                <AudioLines className="h-5 w-5" />
            </h2>

            <Button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm bg-purple-200 text-black px-4 py-2 rounded-full hover:bg-purple-200 transition-all"
            >
                <LogOut className="w-4 h-4" />
                Logout
            </Button>
        </header>
    )
}