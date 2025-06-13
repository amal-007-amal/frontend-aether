import { AudioLines, ChevronRight, Eye, EyeClosed, Loader, ShieldEllipsis } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner"

declare global {
    interface Window {
        sendOtp: (
            identifier: string,
            success: (data: any) => void,
            failure: (error: any) => void
        ) => void;
        verifyOtp: (
            otp: string,
            success: (data: any) => void,
            failure: (error: any) => void,
            refId: string
        ) => void;
        initSendOTP: (config: any) => void;
    }
}

export default function OTPComponent() {
    const location = useLocation()
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [isvisible, setIsVisible] = useState(false)
    const [isLoad, setisLoad] = useState(false)
    const [otp, setOtp] = useState("");
    const [verified, setVerified] = useState(false)
    const [refId, setRefId] = useState("");
    const [surl, setSurl] = useState("")
    const [step, setStep] = useState(0)
    const [showPopup, setShowPopup] = useState(false);
    const [isPass, setIsPass] = useState(false)

    useEffect(() => {
        console.log(location)
        const searchParams = new URLSearchParams(location.search);
        const url = searchParams.get("server_url");

        if (url && url !== "null") {
            setSurl(url);
        }
    }, [location.search]);

    useEffect(() => {
        const existingScript = document.getElementById("otp-provider-script");
        if (!existingScript) {
            const script = document.createElement("script");
            script.id = "otp-provider-script";
            script.src = "https://verify.msg91.com/otp-provider.js";
            script.async = true;
            script.onload = () => {
                const config = {
                    widgetId: "35666d666159303136333037",
                    tokenAuth: "443004T4iZBR2GxY683801a7P1",
                    identifier: "",
                    exposeMethods: true,
                    success: (data: any) => {
                        console.log("OTP Success", data);
                    },
                    failure: (err: any) => {
                        console.log("OTP Error", err);
                    },
                };
                window.initSendOTP?.(config);
                console.log("MSG91 OTP script loaded.");
            };
            document.body.appendChild(script);
        }
    }, []);

    const handleSendOtp = () => {
        if (!/^\d{10}$/.test(phone)) {
            toast("Enter a valid 10-digit number");
            return;
        }
        setisLoad(true)

        const mobile = `91${phone}`;
        window.sendOtp(
            mobile,
            (data) => {
                console.log("OTP Sent Successfully", data);
                toast("✅ OTP Sent successfully!");
                setisLoad(false)
                setVerified(false)
                setShowPopup(true)
                setRefId(data.message);

            },
            (error) => {
                console.error("Send OTP Error:", error);
                toast("❌ Failed to send OTP.");
                setisLoad(false)
            }
        );
    };

    const handleVerifyOtp = () => {
        if (!/^\d{4,6}$/.test(otp)) {
            toast("Enter a valid 4-6 digit OTP");
            return;
        }

        window.verifyOtp(
            otp,
            (data) => {
                console.log("OTP verified:", data);
                toast("✅ OTP verified successfully!");
                setShowPopup(false)
                setVerified(true)
            },
            (error) => {
                console.error("OTP verification failed:", error);
                toast("❌ Invalid OTP or reference ID.");
            },
            refId
        );
    };

    const handleSetNewPassword = () => {
        setIsPass(true)
        setTimeout(() => {
            setIsPass(false)
            setStep(prev => prev - 1)
            setPassword("")
            setPhone("")
        }, 2000);
    }

    return (
        <div className="p-4 max-w-md mx-auto">
            <h2 className="text-5xl font-light mb-4 flex justify-center items-center">A<span className="text-purple-500">ether</span>&nbsp;Hub&nbsp;<AudioLines className="h-10 w-10" /></h2>
            {
                step === 0 ? (
                    <div className="flex flex-col">
                        <input
                            type="text"
                            placeholder="Enter the server url"
                            value={surl}
                            onChange={(e) => setSurl(e.target.value)}
                            className="border rounded-full p-2 w-full mb-2 placeholder:text-sm"
                        />
                        <button
                            onClick={() => setStep((prev) => prev + 1)}
                            className="bg-purple-500 text-white flex my-5 justify-center p-2 rounded-full hover:shadow-lg transition-all">Submit <ChevronRight /> </button>
                    </div>
                ) : step === 1 ? (
                    <>
                        <input
                            type="text"
                            placeholder="Enter phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="border rounded p-2 w-full mb-4 placeholder:text-sm"
                        />
                        <div className="relative">
                            <input
                                type={`${isvisible ? 'text' : 'password'}`}
                                placeholder="Enter New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border rounded-full p-2 w-full mb-2 placeholder:text-sm"
                            />
                            <button className="absolute right-4 top-2" onClick={() => setIsVisible(prev => !prev)}>{isvisible ? <Eye /> : <EyeClosed />}</button>
                        </div>
                        <button
                            onClick={handleSendOtp}
                            className="bg-purple-500 text-white w-full flex my-5 justify-center p-2 rounded-full hover:shadow-lg transition-all"
                        >
                            Login
                        </button>

                        <div className="text-center flex item-center justify-center text-xs gap-2">
                            <button
                                onClick={() => setStep(prev => prev + 1)}
                                className="text-black rounded-full hover:from-blue-600 hover:to-teal-500 underline"
                            >
                                Set a new password
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="border rounded p-2 w-full mb-4 placeholder:text-sm"
                            />
                            <button
                                onClick={handleSendOtp}
                                className="absolute bg-green-500 text-xs text-white hover:shadow-md right-2 top-2 p-1 rounded-full flex gap-2 items-center">
                                {verified ? ('verified') : (<>{isLoad ? (<Loader className="animate-spin w-4 h-4" />) : 'Verify'}</>)}
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type={`${isvisible ? 'text' : 'password'}`}
                                placeholder="Enter New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border rounded p-2 w-full mb-4 placeholder:text-sm"
                            />
                            <button className="absolute right-4 top-2" onClick={() => setIsVisible(prev => !prev)}>{isvisible ? <Eye /> : <EyeClosed />}</button>
                        </div>
                        <button
                            onClick={handleSetNewPassword}
                            className="bg-purple-500 text-white w-full flex my-5 justify-center p-2 rounded-full hover:shadow-lg transition-all"
                        >
                            Set Password
                        </button>
                        {showPopup && (
                            <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
                                    <h2 className="text-xl font-semibold mb-4">Enter OTP</h2>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="border p-2 rounded w-full mb-4 text-center"
                                        placeholder="6-digit OTP"
                                    />
                                    <div className="flex justify-center">
                                        <button
                                            onClick={handleVerifyOtp}
                                            className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 w-full rounded-full"
                                        >
                                            Verify
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {isPass && (
                            <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
                                <Loader className="animate-spin w-8 h-8" />
                            </div>
                        )}
                    </>
                )
            }
        </div>
    );
}
