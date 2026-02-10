'use client';

import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import FooterLink from "@/components/forms/footerLink";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SignUpFormData {
    fullName: string;
    email: string;
    password: string;
}


const SignUp = () => {
    const router = useRouter();
    const [error, setError] = useState<string>("");
   
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
        },
        mode: 'onBlur'
    });

    const onSubmit = async (data: SignUpFormData) => {
        try {
            setError("");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    username: data.fullName,
                    password: data.password,
                }),
            });

            const result = await response.json();
            
            if (result.error) {
                setError(result.error);
                return;
            }

            if (!response.ok) {
                setError('Sign-up failed. Please try again.');
                return;
            }

            // Redirect to sign-in after successful account creation
            router.push('/sign-in');
        } catch (e) {
            console.error('Error during sign-up:', e);
            setError('An error occurred during sign-up. Please try again.');
        }
    }

    return (
        <>
            <h1 className="form-title">Create Your Account</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="fullName"
                    label="Full Name"
                    placeholder="John Doe"
                    register={register}
                    error={errors.fullName}
                    validation={{ required: 'Full name is required', minLength: 2 }}
                />

                <InputField
                    name="email"
                    label="Email"
                    placeholder="your.email@company.com"
                    register={register}
                    error={errors.email}
                    validation={{ required: 'Email is required', pattern: { value: /^\w+@\w+\.\w+$/, message: 'Email address is invalid' } }}
                />

                <InputField
                    name="password"
                    label="Password"
                    placeholder="Enter a strong password"
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{ required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } }}
                />

                <Button type="submit" disabled={isSubmitting} className="cyan-btn w-full mt-5">
                    {isSubmitting ? 'Creating Account' : 'Create Account'}
                </Button>

                <FooterLink text="Already have an account?" linkText="Sign in" href="/sign-in" />
            </form>
        </>
    )
}
export default SignUp;