import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../../components/ui/input-otp";
import { Input } from "../../components/ui/input";
import { postPhoneNumber, postServerUrl } from "../../api/login";

type FormValues = {
    name: string
    phone: string
    otp: string
}

export const AetherOnBoard = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>()

    const [step, setStep] = useState(0)

    const steps = [
        {
            title: "Welcome to Aether",
            description: "Let's start with server url.",
            name: "name" as const,
            type: "text",
            placeholder: "Enter your url",
            validation: { required: "Url is required" },
        },
        {
            title: "Phone Number",
            description: "What's your phone number?",
            name: "phone" as const,
            type: "tel",
            placeholder: "Enter your phone number",
            validation: {
                required: "Phone number is required",
                pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Enter a valid 10-digit phone number",
                },
            },
        },
        {
            title: "OTP Verification",
            description: "Enter the 6-digit OTP sent to your phone.",
            name: "otp" as const,
            type: "otp",
            placeholder: "Enter OTP",
            validation: {
                required: "OTP is required",
                pattern: {
                    value: /^[0-9]{6}$/,
                    message: "Enter a valid 6-digit OTP",
                },
            },
        },
    ]

    useEffect(() => {

    }, [location.pathname])

    const current = steps[step]

    const onSubmit = async (data: FormValues) => {
        try {
            if (step === 0) {
                const responseOne = await postServerUrl(data)
                responseOne.message ? setStep((prev) => prev + 1) : ''
            } else if (step === 1) {
                const responseTwo = await postPhoneNumber(data)
                responseTwo.message ? setStep((prev) => prev + 1) : ''
            } else if (step === 2) {

            }
            if (step < steps.length - 1) {
                setStep((prev) => prev + 1);
            } else {
                console.log("All steps completed.");
            }
        } catch (error) {
            console.error("API error:", error);
            alert("Failed to submit this step. Please try again.");
        }
    }

    const next = () => {
        if (step < steps.length - 1) setStep((prev) => prev + 1)
    }

    const back = () => {
        if (step > 0) setStep((prev) => prev - 1)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="text-center space-y-6">
            <h1 className="text-4xl font-semibold">{current.title}</h1>
            <p className="text-gray-600">{current.description}</p>

            <div>
                {current.type === "otp" ? (
                    <div className="flex justify-center">
                        <InputOTP maxLength={6}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                ) : (
                    <>
                        <Input
                            type={current.type}
                            inputMode={current.type === "tel" ? "tel" : undefined}
                            placeholder={current.placeholder}
                            className="border p-2 w-full rounded shadow"
                            {...register(current.name, current.validation)}
                        />
                        {errors[current.name] && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors[current.name]?.message}
                            </p>
                        )}
                    </>
                )}
            </div>

            <div className="flex justify-between max-w-md mx-auto">
                <button
                    type="button"
                    onClick={back}
                    disabled={step === 0}
                    className="px-4 py-2 rounded-full shadow bg-gray-200 disabled:opacity-50"
                >
                    Back
                </button>

                {step < steps.length - 1 ? (
                    <button
                        type="button"
                        onClick={next}
                        className="px-4 py-2 rounded-full text-violet-500 shadow"
                    >
                        Next
                    </button>
                ) : (
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-full bg-violet-600 text-white"
                    >
                        Finish
                    </button>
                )}
            </div>
        </form>
    )
}
