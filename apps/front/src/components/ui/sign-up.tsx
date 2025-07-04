import React, { useState } from 'react';
import { Eye, EyeOff, Building2, Mail, Lock, Users } from 'lucide-react';
import Image from 'next/image';

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignUpPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignUp?: (event: React.FormEvent<HTMLFormElement>) => void;
  onResetPassword?: () => void;
  onSignIn?: () => void;
  mode?: 'new-company' | 'create-user';
  onModeChange?: (mode: 'new-company' | 'create-user') => void;
}

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
  <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-card/40 dark:bg-zinc-800/40 backdrop-blur-xl border border-white/10 p-5 w-64`}>
    <Image src={testimonial.avatarSrc} width={40} height={40} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium">{testimonial.name}</p>
      <p className="text-muted-foreground">{testimonial.handle}</p>
      <p className="mt-1 text-foreground/80">{testimonial.text}</p>
    </div>
  </div>
);

export const SignUpPage: React.FC<SignUpPageProps> = ({
  title = <span className="font-light text-foreground tracking-tighter">Get Started</span>,
  description = "Create your account and start your journey with us",
  heroImageSrc,
  testimonials = [],
  onSignUp,
  onSignIn,
  mode = 'new-company',
  onModeChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-geist">
      {/* Left column: sign-up form */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight">{title}</h1>
            <p className="animate-element animate-delay-200 text-muted-foreground">{description}</p>

            <div className="animate-element animate-delay-300 mb-4">
              <div className="flex rounded-xl bg-muted p-1">
                <button
                  type="button"
                  onClick={() => onModeChange?.('new-company')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${mode === 'new-company' ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Create New Company
                </button>
                <button
                  type="button"
                  onClick={() => onModeChange?.('create-user')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${mode === 'create-user' ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Create User
                </button>
              </div>
            </div>

            <form className="space-y-4" onSubmit={onSignUp}>
              <div className="animate-element animate-delay-400">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <GlassInputWrapper>
                  <div className="flex items-center px-4">
                    <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                    <input 
                      name="email" 
                      type="email" 
                      placeholder="Enter your email address" 
                      className="w-full bg-transparent text-sm py-4 focus:outline-none" 
                      required
                    />
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <GlassInputWrapper>
                  <div className="relative flex items-center px-4">
                    <Lock className="h-4 w-4 text-muted-foreground mr-2" />
                    <input 
                      name="password" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Create a strong password" 
                      className="w-full bg-transparent text-sm py-4 pr-10 focus:outline-none" 
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              {mode === 'new-company' ? (
                <>
                  <div className="animate-element animate-delay-600">
                    <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                    <GlassInputWrapper>
                      <div className="flex items-center px-4">
                        <Building2 className="h-4 w-4 text-muted-foreground mr-2" />
                        <input 
                          name="company_name" 
                          type="text" 
                          placeholder="Your company name" 
                          className="w-full bg-transparent text-sm py-4 focus:outline-none" 
                          required
                        />
                      </div>
                    </GlassInputWrapper>
                  </div>

                  <div className="animate-element animate-delay-700">
                    <label className="text-sm font-medium text-muted-foreground">Industry</label>
                    <GlassInputWrapper>
                      <div className="flex items-center px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground mr-2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                        </svg>
                        <select 
                          name="industry" 
                          className="w-full bg-transparent text-sm py-4 focus:outline-none appearance-none"
                          required
                        >
                          <option value="">Select industry</option>
                          <option value="technology">Technology</option>
                          <option value="finance">Finance</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="education">Education</option>
                          <option value="retail">Retail</option>
                          <option value="manufacturing">Manufacturing</option>
                          <option value="consulting">Consulting</option>
                          <option value="marketing">Marketing</option>
                          <option value="other">Other</option>
                        </select>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground ml-2">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </GlassInputWrapper>
                  </div>

                  <div className="animate-element animate-delay-800">
                    <label className="text-sm font-medium text-muted-foreground">Number of Employees</label>
                    <GlassInputWrapper>
                      <div className="flex items-center px-4">
                        <Users className="h-4 w-4 text-muted-foreground mr-2" />
                        <select 
                          name="employees" 
                          className="w-full bg-transparent text-sm py-4 focus:outline-none appearance-none"
                          required
                        >
                          <option value="">Select company size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="501-1000">501-1000 employees</option>
                          <option value="1000+">1000+ employees</option>
                        </select>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground ml-2">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </GlassInputWrapper>
                  </div>
                </>
              ) : (
                <div className="animate-element animate-delay-600">
                  <label className="text-sm font-medium text-muted-foreground">Invite Code</label>
                  <GlassInputWrapper>
                    <div className="flex items-center px-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground mr-2">
                        <path d="M10 2h4" />
                        <path d="M4 6c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z" />
                        <path d="M10 10.5h1" />
                        <path d="M14 10.5h1" />
                        <path d="M10 14h1" />
                        <path d="M14 14h1" />
                      </svg>
                      <input 
                        name="invite_code" 
                        type="text" 
                        placeholder="Enter your invite code" 
                        className="w-full bg-transparent text-sm py-4 focus:outline-none" 
                        required
                      />
                    </div>
                  </GlassInputWrapper>
                </div>
              )}

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="animate-element animate-delay-900 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {mode === 'new-company' ? 'Create Company & Account' : 'Create Account'}
                </button>
              </div>
            </form>

            <p className="animate-element animate-delay-1100 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <a 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  onSignIn?.(); 
                }} 
                className="text-violet-400 hover:underline transition-colors"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden lg:block flex-1 relative p-4">
          <div className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center" style={{ backgroundImage: `url(${heroImageSrc})` }}></div>
          {testimonials.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
              <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
              {testimonials[1] && <div className="hidden xl:flex"><TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" /></div>}
              {testimonials[2] && <div className="hidden 2xl:flex"><TestimonialCard testimonial={testimonials[2]} delay="animate-delay-1400" /></div>}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
