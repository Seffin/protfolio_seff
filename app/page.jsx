import Link from "next/link";
import Image from "next/image";
import React, { Suspense } from "react";
import data from "../data.json";
import { ProfileOrganizations } from "./components/orgs";
import { RecentActivity, CopilotActivity } from "./components/recent-activity";
import { getUser } from "./data";
import LoadingIndicator from "./components/loading-indicator";
import { Resume } from "./components/resume";

const navigation = [
	{ name: "Projects", href: "/projects" },
	{ name: "Contact", href: "/contact" },
];

export default async function Home(props) {
    const searchParams = await props.searchParams;

    return (
		<LandingComponent searchParams={searchParams} />
	)
}

const UserIcon = async ({ promise }) => {

	const user = await promise;

	return (
		<Image alt='👨‍💻' width={100} height={100} src={user.avatar_url || data.avatarUrl} className="float-right rounded-full mx-4" />
	);
};

const UserText = async ({ promise }) => {

	const user = await promise;

	return (
		<p>Hi, my name is {user.name || data.displayName}{'. '}{user.bio}</p>
	);
};

const LandingComponent = async ({ searchParams: { customUsername } }) => {

	const username = customUsername || process.env.GITHUB_USERNAME || data.githubUsername;
	const promise = getUser(username);

	return (
		<div className="flex flex-col items-center justify-center w-screen min-h-screen overflow-y-auto bg-linear-to-tl from-black via-zinc-600/20 to-black">
			<nav className="my-16 animate-fade-in">
				<ul className="flex items-center justify-center gap-6">
					{navigation.map((item) => (
						<Link
							key={item.href}
							href={item.href + (customUsername ? `?customUsername=${customUsername}` : '')}
							className="text-base md:text-lg duration-500 text-zinc-400 hover:text-zinc-100"
						>
							<span className="inline-flex items-center">
								{item.name} <LoadingIndicator />
							</span>
						</Link>
					))}
					<a
						href="/Seffin0.1.pdf"
						download="Seffin_Tom_Mathew_Resume.pdf"
						target="_blank"
						rel="noopener noreferrer"
						className="text-base md:text-lg duration-300 text-zinc-300 hover:text-white px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 bg-zinc-900/60 hover:bg-zinc-800 transition-all inline-flex items-center gap-2"
					>
						<span>Download Resume</span> 📄
					</a>
				</ul>
			</nav>
			<div className="hidden w-screen h-px animate-glow md:block animate-fade-left bg-linear-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />

			<h1 className="flex items-center z-10 text-4xl hover:scale-110 text-transparent duration-1000 cursor-default text-edge-outline animate-title font-display sm:text-6xl md:text-9xl whitespace-nowrap bg-clip-text bg-white p-5">
				{username}
				<Suspense fallback={<p>Loading...</p>}>
					<UserIcon promise={promise} />
				</Suspense>
			</h1>

			<div className="hidden w-screen h-px animate-glow md:block animate-fade-right bg-linear-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0" />
			<div className="my-16 text-center animate-fade-in">
				<h2 className="text-lg text-zinc-500">
					<Suspense fallback={<div className="w-full h-px min-h-28">Loading...</div>}>
						<div className="w-full h-px min-h-28">
							<UserText promise={promise} />
							<ProfileOrganizations username={username} />
							<RecentActivity username={username} />
							<CopilotActivity username={username} />
						</div>
					</Suspense>
				</h2>
				<Resume />
			</div>

		</div>
	);
}
