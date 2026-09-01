import {useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function HomePage() {
    const location = useLocation();

    useEffect(() =>{
        if(location.hash){
            const el = document.querySelector(location.hash);
            if (el) el.scrollIntoView({ behavior: 'smooth'})
        }
    }, [location]);
    
    return (
        <section className="relative overflow-hidden">
            <main className="relative min-h-[85vh] max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12 px-8 lg:px-16 py-12 lg:py-0">
                <div className=" flex flex-col justify-center px-10 md:px-16 py-16">
                    <span className="inline-block w-fit text-[11px] font-mono uppercase tracking-[0.2em] text-orange-400/80 mb-6">
                    Resource Portal · Now Live
                    </span>

                    <h1 className="text-5xl font-bold tracking-tight leading-[1.15] text-black dark:text-white mb-6 text-left">
                        <span className="text-brand block mb-2">
                            Where students &amp; faculty
                        </span>
                        <span>
                            create and access the campus resources.
                        </span>
                    </h1>

                    <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-md leading-relaxed mb-10 text-left">
                        One unified platform for classroom notes, syllabus archives, library loans, and lab equipment access.
                    </p>

                    <div className="flex items-center gap-4 mb-12">
                    <button className="bg-brand hover:opacity-90 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-opacity">
                        Explore Resources
                    </button>
                        <button className="bg-transparent border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900">
                        Sign In
                    </button>
                    </div>
                </div>

                <div className="flex items-center justify-center px-10 md:px-16 py-16">
                    <div className="w-full max-w-md rounded-2xl overflow-hidden border border-neutral-800">
                    <img
                        src="https://ayerssaintgross.com/wp-content/uploads/2022/01/1_UVA_AldermanRoadHousing-Exterior.jpg"
                        alt="Campus building"
                        className="w-full h-[520px] object-cover"
                    />
                    </div>
                </div>

                </main>

        <section id="how-it-works" className="max-w-5xl mx-auto px-10 py-24">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 block mb-4">
                How It Works
            </span>
            <h2 className="text-4xl font-bold tracking-tight mb-16 max-w-2xl">
                From sign in to return, in four steps.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                { step: '01', title: 'Sign In', desc: 'Every account (Student, Faculty, Library Staff, Lab Staff, Admin) is created by the Admin. Sign in with the email and password issued to you.' },
                { step: '02', title: 'Browse & Request', desc: 'Find books, lab equipment, classroom notes, syllabus, or study materials by department and section, then request or reserve what you need.' },
                { step: '03', title: 'Get Approved', desc: 'Library or Lab staff (or faculty, for classroom resources) review your request and approve it with a due date.' },
                { step: '04', title: 'Track & Return', desc: 'Get a reminder 24 hours before your due date, return on time, and your history updates automatically.' },
                ].map((s) => (
                <div key={s.step} className="border border-border-subtle rounded-2xl p-6 bg-surface">
                    <span className="text-xs font-mono text-brand block mb-3">{s.step}</span>
                    <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{s.desc}</p>
                </div>
                ))}
            </div>
        </section>

        <section id="features" className="max-w-5xl mx-auto px-10 py-24">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 block mb-4">
                Features & Benefits
            </span>
            <h2 className="text-4xl font-bold tracking-tight mb-16 max-w-2xl">
                Built for how students, faculty, and staff actually work.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                { title: 'Resource Booking', desc: 'Request and reserve books, equipment, and classrooms with instant status tracking.' },
                { title: 'Role-Based Dashboards', desc: 'Student, Faculty, Library Staff, Lab Staff, and Admin each get a tailored workspace.' },
                { title: 'Return & Deadline Tracking', desc: 'Automatic reminders 24 hours before due dates, with overdue flagging built in.' },
                { title: 'Classroom Resource Sharing', desc: 'Faculty post syllabus, notes, and study materials directly into subject tabs.' },
                { title: 'Live Notifications', desc: 'Approvals, rejections, and new posts land in a real-time notification bell.' },
                { title: 'Light & Dark Theme', desc: 'Switch instantly from the nav, applied consistently across every dashboard.' },
                ].map((f) => (
                <div key={f.title} className="border border-border-subtle rounded-2xl p-6 bg-surface">
                    <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{f.desc}</p>
                </div>
                ))}
            </div>
            </section>

        </section>
    );
}