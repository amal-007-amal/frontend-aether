import { AudioLines, CheckCircle, ChevronRight, Eye, EyeClosed, Loader, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getServerUrl, postLogin, postSetPasswordLogin } from "../../api/login";

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
    const aetherNaviagte = useNavigate()
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [isvisible, setIsVisible] = useState(false)
    const [isLoad, setisLoad] = useState(false)
    const [otp, setOtp] = useState("");
    const [verified, setVerified] = useState(false)
    const [refId, setRefId] = useState("");
    const [surl, setSurl] = useState("")
    const [otpjwt, setOtpjwt] = useState("")
    const [step, setStep] = useState(0)
    const [showPopup, setShowPopup] = useState(false);
    const [isPass, setIsPass] = useState(false);

    useEffect(() => {
        setVerified(false)
    }, [phone])

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
            toast.warning("Enter a valid 10-digit number");
            return;
        }
        setisLoad(true)

        const mobile = `91${phone}`;
        window.sendOtp(
            mobile,
            (data) => {
                console.log("OTP Sent Successfully", data);
                toast.success("OTP Sent successfully!", {
                    icon: <CheckCircle className="text-green-500 h-4 w-4 "></CheckCircle>
                });
                setisLoad(false)
                setVerified(false)
                setShowPopup(true)
                setRefId(data.message);

            },
            (error) => {
                console.error("Send OTP Error:", error);
                toast("Failed to send OTP.", {
                    icon: <X className="text-green-500"></X>
                });
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
                setOtpjwt(data.message)
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

    const handleSetNewPassword = async () => {
        setIsPass(true)
        try {
            if (verified) {
                const payload = new URLSearchParams({
                    client_type: 'console',
                    client_key: 'your_console_key_here',
                    device_id: '1234',
                    otp_jwt: otpjwt,
                    phone_number: phone,
                    password: password,
                });

                const setPasswordResponse = await postSetPasswordLogin(payload)
                if (setPasswordResponse===null) {
                    setStep(prev => prev - 1)
                    setPassword("")
                    setPhone("")
                }
                setIsPass(false)
            } else {
                toast("Kindly verify your phonenumber.", {
                    icon: <X className="w-4 h-4 text-red-400"></X>
                });
            }
        } catch (error) {
            toast.error("Invalid Credentails.Please Contact administrator.", {
                icon: <X className="w-4 h-4 text-red-400"></X>
            });
        }
    }

    useEffect(() => {
        const savedUrl = localStorage.getItem("aether_server_url");
        if (savedUrl) {
            setSurl(savedUrl);
        }
    }, []);

    const handleServerUrl = async () => {
        setIsPass(true);

        try {
            const trimmedUrl = surl.trim();

            if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
                toast.error("Please enter a valid URL");
                setIsPass(false);
                return;
            }
            const tempUrl = new URL(trimmedUrl).origin;
            localStorage.setItem("aether_temp_url", tempUrl);
            const serverUrlResponse = await getServerUrl(tempUrl);

            if (serverUrlResponse) {
                localStorage.setItem("aether_server_url", tempUrl);
                localStorage.removeItem("aether_temp_url");
                setIsPass(false);
                setStep((prev) => prev + 1);
            } else {
                toast.error("Invalid server url!", {
                    icon: <X className="w-4 h-4 text-red-400" />,
                });
            }

            setIsPass(false);
        } catch (error) {
            toast.error("Invalid server url!", {
                icon: <X className="w-4 h-4 text-red-400" />,
            });
            setIsPass(false);
        }
    };


    const handleLogin = async () => {
        setIsPass(true);
        try {
            const payload = new URLSearchParams({
                client_type: 'console',
                client_key: 'your_console_key_here',
                device_id: '1234',
                otp_jwt: "",
                phone_number: phone,
                password: password,
            });

            const loginResponse = await postLogin(payload);

            if (loginResponse) {
                sessionStorage.setItem('aether_accesstoken', loginResponse.access_token);
                sessionStorage.setItem('aether_refreshtoken', loginResponse.refresh_token);
                setTimeout(() => {
                    setIsPass(false);
                    aetherNaviagte("/dashboard");
                }, 500);
            }
        } catch (error: any) {
            console.error("Login error:", error);
            toast.error("Login failed. Please try again later.");
            setIsPass(false);
        }
    };


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
                            onClick={() => {
                                if (surl !== "") {
                                    handleServerUrl()
                                }
                            }}
                            className={`${surl === "" ? 'cursor-not-allowed opacity-50' : ''} bg-gradient-to-r from-purple-600 to-gray-300 text-white flex my-5 justify-center p-2 rounded-full hover:shadow-lg transition-all`}>Submit <ChevronRight /> </button>
                    </div>
                ) : step === 1 ? (
                    <>
                        <input
                            type="text"
                            placeholder="Enter phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="border rounded-full p-2 w-full mb-4 placeholder:text-sm"
                        />
                        <div className="relative">
                            <input
                                type={`${isvisible ? 'text' : 'password'}`}
                                placeholder="Enter Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border rounded-full p-2 w-full mb-2 placeholder:text-sm"
                            />
                            <button className="absolute right-4 top-2" onClick={() => setIsVisible(prev => !prev)}>{isvisible ? <Eye /> : <EyeClosed />}</button>
                        </div>
                        <button
                            onClick={() => {
                                if (phone !== "" && password !== "") {
                                    handleLogin()
                                }
                            }}
                            className={`${password === "" || phone === "" ? "cursor-not-allowed opacity-50" : ""
                                } bg-gradient-to-r from-purple-600 to-gray-300 text-white w-full flex my-5 justify-center p-2 rounded-full hover:shadow-lg transition-all`}
                        >
                            Login
                        </button>

                        <div className="text-center flex item-center justify-center text-xs gap-2">
                            <button
                                onClick={() => {
                                    setPassword("")
                                    setStep(prev => prev + 1)
                                }}
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
                                className="border rounded-full p-2 w-full mb-4 placeholder:text-sm"
                            />
                            <button
                                onClick={handleSendOtp}
                                className="absolute bg-purple-500 text-xs text-white hover:shadow-md right-2 top-2 p-1 rounded-full flex gap-2 items-center">
                                {verified ? ('verified') : (<>{isLoad ? (<Loader className="animate-spin w-4 h-4" />) : 'Verify'}</>)}
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type={`${isvisible ? 'text' : 'password'}`}
                                placeholder="Enter New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border rounded-full p-2 w-full mb-4 placeholder:text-sm"
                            />
                            <button className="absolute right-4 top-2" onClick={() => setIsVisible(prev => !prev)}>{isvisible ? <Eye /> : <EyeClosed />}</button>
                        </div>
                        <button
                            onClick={() => {
                                if (password !== "") {
                                    handleSetNewPassword();
                                }
                            }}
                            className={`${password === "" ? "cursor-not-allowed opacity-50" : ""
                                } bg-gradient-to-r from-purple-500 to-gray-300 text-white w-full flex my-5 justify-center p-2 rounded-full hover:shadow-lg transition-all`}
                        >
                            Set Password
                        </button>
                        {showPopup && (
                            <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
                                    <input
                                        type="text"
                                        maxLength={4}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="border p-2 rounded-full w-full mb-4 text-center"
                                        placeholder="4-digit OTP"
                                    />
                                    <div className="flex justify-center gap-10">
                                        <button
                                            onClick={handleVerifyOtp}
                                            className="bg-gradient-to-r from-purple-500 to-gray-300 text-white px-4 py-1 hover:bg-purple-600 w-full rounded-full"
                                        >
                                            Verify
                                        </button>
                                        <button
                                            onClick={() => { setShowPopup(prev => !prev) }}
                                            className="bg-gray-400 text-white px-4 py-1 hover:bg-gray-600 w-full rounded-full"
                                        >
                                            close
                                        </button>
                                    </div>
                                    <p className="text-xs font-normal my-3">Please enter the OTP sent to your registered mobile number</p>
                                </div>
                            </div>
                        )}
                    </>
                )
            }
            {isPass && (
                <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
                    <Loader className="animate-spin w-6 h-6 text-purple-500" />
                </div>
            )}
        </div>
    );
}
