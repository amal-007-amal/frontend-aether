import { AudioLines, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
    return (
        <header className="bg-white text-white p-4 border-b border-b-gray-300 flex justify-between items-center">
            <h2 className="font-light flex text-black text-xl items-center">
                A<span className="text-purple-500">ether</span>&nbsp;Hub&nbsp;
                <AudioLines className="h-5 w-5" />
            </h2>

            <Link
                to="/"
                className="flex items-center gap-2 text-sm bg-white text-black px-4 py-2 rounded-full hover:bg-purple-200 transition-all"
            >
                <LogOut className="w-4 h-4" />
                Logout
            </Link>
        </header>
    )
}