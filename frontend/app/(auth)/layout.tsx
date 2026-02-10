import Link from "next/link";
import Image from "next/image";

const Layout = ({ children }: { children : React.ReactNode }) => {
    return (
        <main className="auth-layout">
           <section className="auth-left-section scrollbar-hide-default">
                <Link href="/" className="auth-logo">
                    <Image src="/assets/logo.svg" alt="Signalist logo" width={170} height={40} className='h-8 w-auto' />
                </Link>

                <div className="pb-6 lg:pb-8 flex-1">{children}</div>
            </section>

            <section className="auth-right-section">
                <div className="z-10 relative lg:mt-4 lg:mb-16">
                    <blockquote className="auth-blockquote">
                        <h2 className="text-2xl font-bold mb-4">Welcome to StockNex</h2>
                        <p className="text-lg leading-relaxed">
                            StockNex is your intelligent platform for predicting market trends and company data. Using advanced analytics and machine learning, we help you make data-driven decisions about stocks and market movements with confidence and precision.
                        </p>
                    </blockquote>
                    <div className="flex items-center justify-between">
                        <div>
                            <cite className="auth-testimonial-author">Advanced Predictions</cite>
                            <p className="max-md:text-xs text-gray-500">Real-time market insights</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Image src="/assets/star.svg" alt="Star" key={star} width={20} height={20} className="w-5 h-5" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 relative">
                    <Image src="/assets/dashboard.png" alt="Dashboard Preview" width={1240} height={1050} className="auth-dashboard-preview absolute top-0" />
                </div>
            </section>
        </main>
    )
}
export default Layout