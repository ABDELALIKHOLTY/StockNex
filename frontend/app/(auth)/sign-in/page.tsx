'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import InputField from '@/components/forms/InputField';
import FooterLink from '@/components/forms/footerLink';
import { useState } from 'react';
import {useRouter} from "next/navigation";
import LoadingScreen from '@/components/LoadingScreen';

const SignIn = () => {
    const router = useRouter();
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onBlur',
    });

    const onSubmit = async (data: SignInFormData) => {
        try {
            setError("");
            setIsLoading(true);  // Show loading screen
            
            // Try to login as regular user first
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                }),
            });

            const result = await response.json();
            
            console.log('📥 Backend response:', JSON.stringify(result, null, 2));

            if (result.error) {
                setError(result.error);
                setIsLoading(false);
                return;
            }

            if (!response.ok) {
                setError('Sign-in failed. Please try again.');
                setIsLoading(false);
                return;
            }

            // Store token FIRST
            if (!result.token) {
              console.error('❌ No token in response!');
              setError('Login failed: No token received');
              setIsLoading(false);
              return;
            }
            
            localStorage.setItem('token', result.token);
            console.log('✅ Token stored in localStorage');

            // Get userId - multiple sources
            let userId = null;
            
            // Source 1: Direct from login response
            if (result.id && typeof result.id === 'number') {
              userId = result.id;
              console.log('✅ Source 1 SUCCESS - userId from result.id:', userId);
            } else if (result.userId && typeof result.userId === 'number') {
              userId = result.userId;
              console.log('✅ Source 1 ALTERNATE - userId from result.userId:', userId);
            } else {
              console.warn('⚠️ Source 1 FAILED - no numeric id in login response. Keys:', Object.keys(result));
            }

            // Source 2: Call /user endpoint with token
            if (!userId) {
              console.log('🔄 Attempting Source 2 - Fetching from /user endpoint...');
              try {
                const userResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/user`,
                  {
                    headers: {
                      'Authorization': `Bearer ${result.token}`,
                      'Content-Type': 'application/json'
                    }
                  }
                );
                
                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  console.log('✅ Source 2 SUCCESS - /user response:', userData);
                  if (userData.id && typeof userData.id === 'number') {
                    userId = userData.id;
                    console.log('✅ Source 2 - userId from /user endpoint:', userId);
                  }
                } else {
                  console.warn('⚠️ Source 2 FAILED - /user returned:', userResponse.status);
                }
              } catch (e) {
                console.error('⚠️ Source 2 ERROR:', e);
              }
            }

            // Source 3: Decode from JWT
            if (!userId) {
              console.log('🔄 Attempting Source 3 - Decoding JWT...');
              try {
                const parts = result.token.split('.');
                if (parts.length === 3) {
                  const decoded = JSON.parse(atob(parts[1]));
                  console.log('🔓 JWT decoded:', decoded);
                  if (decoded.id && typeof decoded.id === 'number') {
                    userId = decoded.id;
                    console.log('✅ Source 3 SUCCESS - userId from JWT:', userId);
                  }
                }
              } catch (e) {
                console.error('⚠️ Source 3 ERROR:', e);
              }
            }

            // FINAL CHECK
            if (!userId || typeof userId !== 'number') {
              console.error('❌ FATAL: Could not obtain userId from any source!');
              setError('Login failed: Could not identify user. Please contact support.');
              setIsLoading(false);
              return;
            }

            // Store all user data
            const finalUsername = result.username || result.name || '';
            localStorage.setItem('userId', String(userId));
            localStorage.setItem('isAdmin', result.isAdmin ? 'true' : 'false');
            localStorage.setItem('adminEmail', result.email);
            localStorage.setItem('userName', finalUsername);
            
            console.log('✅✅✅ LOGIN SUCCESS - All data stored:');
            console.log({
              token: '✅ stored',
              userId: localStorage.getItem('userId'),
              userName: localStorage.getItem('userName'),
              adminEmail: localStorage.getItem('adminEmail'),
              isAdmin: localStorage.getItem('isAdmin')
            });
            
            // Keep loading for 3s then redirect
            setTimeout(() => {
              if (result.isAdmin) {
                router.push('/admin');
              } else {
                router.push('/');
              }
            }, 3000);
        } catch (e) {
            console.error(e);
            setError('An error occurred during sign-in. Please try again.');
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return <LoadingScreen showOnce={false} />;
    }

    return (
        <>
            <h1 className="form-title">Access Your Predictions</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className={`space-y-5 ${isSubmitting ? 'hidden' : ''}`}>
                <InputField
                    name="email"
                    label="Email"
                    placeholder="your.email@company.com"
                    register={register}
                    error={errors.email}
                    validation={{ required: 'Email is required', pattern: /^\w+@\w+\.\w+$/ }}
                />

                <InputField
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{ required: 'Password is required', minLength: 8 }}
                />

                <Button type="submit" disabled={isSubmitting} className="cyan-btn w-full mt-5">
                    {isSubmitting ? 'Signing In' : 'Access Predictions'}
                </Button>

                <FooterLink text="Don't have an account?" linkText="Create an account" href="/sign-up" />
            </form>
        </>
    );
};
export default SignIn;