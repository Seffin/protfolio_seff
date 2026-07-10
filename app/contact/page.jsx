import { FaGithub, FaLinkedin, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { GoMail, GoPerson } from 'react-icons/go';
import Link from "next/link";
import { FaXTwitter } from "react-icons/fa6";
import { Navigation } from "../components/nav";
import { Card } from "../components/card";
import data from "../../data.json";
import { getUser, getSocialAccounts } from "../data";

export default async function Contacts(props) {
    const searchParams = await props.searchParams;

    const {
        customUsername
    } = searchParams;

    const username = customUsername || process.env.GITHUB_USERNAME || data.githubUsername;
    // Get both user and socials in parallel.
    const userData = getUser(username);
    const socialsData = getSocialAccounts(username);
    const [user, githubSocials] = await Promise.all([userData, socialsData]);
    
    const email = user.email || data.email;
    const phone = data.phone;
    const locations = data.locations;
    
    const contacts = [];
    
    if (phone) {
		contacts.push({
			icon: <FaPhone size={20} />,
			href: "tel:" + phone.replace(/\s+/g, ''),
			label: "Phone",
			handle: phone,
		});
	}

    if (locations) {
		contacts.push({
			icon: <FaMapMarkerAlt size={20} />,
			href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locations)}`,
			label: "Location",
			handle: locations,
		});
	}

    if (email) {
		contacts.push({
			icon: <GoMail size={20} />,
			href: "mailto:" + email,
			label: "Email",
			handle: email,
		});
	}
    contacts.push({
		icon: <FaGithub size={20} />,
		href: "https://github.com/" + username,
		label: "Github",
		handle: username,
	});

    let hasLinkedIn = false;
    if (data.socials?.linkedin) {
        hasLinkedIn = true;
        contacts.push({
            icon: <FaLinkedin size={20} />,
            href: data.socials.linkedin,
            label: "linkedin",
            handle: data.socials.linkedin.split("/").pop(),
        });
    }

    githubSocials.forEach((s) => {
		switch (s.provider) {
			case "linkedin":
                if (!hasLinkedIn) {
                    contacts.push({
                        icon: <FaLinkedin size={20} />,
                        href: s.url,
                        label: s.provider,
                        // Extract last aprt of the url.
                        handle: s.url.split("/").pop(),
                    });
                }
				break;
			case "twitter":
				contacts.push({
					icon: <FaXTwitter size={20} />,
					href: s.url,
					label: s.provider,
					// Extract last aprt of the url.
					handle: s.url.split("/").pop(),
				});
				break;
			default:
				contacts.push({
					icon: <GoPerson size={20} />,
					href: s.url,
					// Extract domain from url.
					label: s.url.split("/")[2],
					// Extract last part of the url. Might not make sense in some cases.
					// handle: s.url.split("/").pop(),
				});
				break;
		}
	});

    return (
		<div className=" bg-linear-to-tl from-zinc-900/0 via-zinc-900 to-zinc-900/0">
			<Navigation />
			<div className="container flex items-center justify-center min-h-screen px-4 mx-auto">
				<div className="grid w-full grid-cols-1 gap-8 mx-auto mt-32 sm:mt-0 sm:grid-cols-3 lg:gap-16">
					{contacts.map((s) => {
						return (
							<Card key={s.label}>
								<Link
									href={s.href}
									target="_blank"
									className="p-4 relative flex flex-col items-center gap-4 duration-700 group md:gap-8 md:py-24 lg:pb-48 md:p-16 sm:p-8"
								>
									<span
										className="absolute w-px h-2/3 bg-linear-to-b from-zinc-500 via-zinc-500/50 to-transparent"
										aria-hidden="true"
									/>
									<span className="relative z-10 flex items-center justify-center w-12 h-12 text-sm duration-1000 border rounded-full text-zinc-200 group-hover:text-white group-hover:bg-zinc-900 border-zinc-500 bg-zinc-900 group-hover:border-zinc-200 drop-shadow-orange">
										{s.icon}
									</span>{" "}
									<div className="z-10 flex flex-col items-center w-full">
										<span className={`text-center break-words text-lg font-medium duration-150 lg:text-xl text-zinc-200 group-hover:text-white font-display px-2`}>
											{s.handle}
										</span>
										<span className="mt-4 text-sm text-center duration-1000 text-zinc-400 group-hover:text-zinc-200">
											{s.label}
										</span>
									</div>
								</Link>
							</Card>
						)
					})}
				</div>
			</div>
		</div>
	);
}
