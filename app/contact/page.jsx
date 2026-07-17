import { FaGithub, FaLinkedin, FaPhone, FaMapMarkerAlt, FaInstagram, FaFacebook, FaWhatsapp, FaGlobe } from "react-icons/fa";
import { GoMail, GoPerson } from 'react-icons/go';
import Link from "next/link";
import { FaXTwitter } from "react-icons/fa6";
import { Navigation } from "../components/nav";
import { Card } from "../components/card";
import data from "../../data.json";
import { getUser, getSocialAccounts } from "../data";
import { ContactForm } from "./contact-form";

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
			icon: <FaPhone size={18} />,
			href: "tel:" + phone.replace(/\s+/g, ''),
			label: "Phone",
			handle: phone,
		});
	}

    if (locations) {
		contacts.push({
			icon: <FaMapMarkerAlt size={18} />,
			href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locations)}`,
			label: "Location",
			handle: locations,
		});
	}

    if (email) {
		contacts.push({
			icon: <GoMail size={18} />,
			href: "mailto:" + email,
			label: "Email",
			handle: email,
		});
	}
    contacts.push({
		icon: <FaGithub size={18} />,
		href: "https://github.com/" + username,
		label: "Github",
		handle: username,
	});

    let hasLinkedIn = false;
    if (data.socials?.linkedin) {
        hasLinkedIn = true;
        contacts.push({
            icon: <FaLinkedin size={18} />,
            href: data.socials.linkedin,
            label: "LinkedIn",
            handle: data.socials.linkedin.split("/").pop(),
        });
    }

    if (data.socials?.instagram) {
        contacts.push({
            icon: <FaInstagram size={18} />,
            href: data.socials.instagram,
            label: "Instagram",
            handle: data.socials.instagram.split("/").filter(Boolean).pop(),
        });
    }

    if (data.socials?.facebook) {
        contacts.push({
            icon: <FaFacebook size={18} />,
            href: data.socials.facebook,
            label: "Facebook",
            handle: data.socials.facebook.split("/").filter(Boolean).pop(),
        });
    }

    if (data.socials?.whatsapp) {
        contacts.push({
            icon: <FaWhatsapp size={18} />,
            href: data.socials.whatsapp,
            label: "WhatsApp",
            handle: phone || "WhatsApp Chat",
        });
    }

    if (data.socials?.portfolio) {
        contacts.push({
            icon: <FaGlobe size={18} />,
            href: data.socials.portfolio,
            label: "Portfolio",
            handle: data.socials.portfolio.replace("https://", "").replace("http://", "").replace("/", ""),
        });
    }

    githubSocials.forEach((s) => {
		switch (s.provider) {
			case "linkedin":
				if (!hasLinkedIn) {
					contacts.push({
						icon: <FaLinkedin size={18} />,
						href: s.url,
						label: "LinkedIn",
						handle: s.url.split("/").pop(),
					});
				}
				break;
			case "twitter":
				contacts.push({
					icon: <FaXTwitter size={18} />,
					href: s.url,
					label: "Twitter",
					handle: s.url.split("/").pop(),
				});
				break;
			default:
				contacts.push({
					icon: <GoPerson size={18} />,
					href: s.url,
					label: s.url.split("/")[2] || "Link",
					handle: s.url.split("/").pop() || "Profile",
				});
				break;
		}
	});

    return (
		<div className="bg-linear-to-tl from-zinc-950 via-zinc-900 to-zinc-950 min-h-screen text-zinc-200">
			<Navigation />
			<div className="container flex flex-col justify-center min-h-screen px-6 py-24 mx-auto max-w-6xl">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mt-12">
					
					{/* Left Column: Heading and Contact Links */}
					<div className="lg:col-span-5 space-y-8">
						<div>
							<h1 className="text-4xl font-bold tracking-tight text-white font-display sm:text-5xl">
								Let's Connect
							</h1>
							<p className="mt-4 text-zinc-400 leading-relaxed text-sm sm:text-base">
								Have an interesting project, job opportunity, or just want to say hello? 
								Feel free to reach out. I'm always open to discussing new ideas and creative collaborations.
							</p>
						</div>

						<div className="flex flex-col gap-4">
							{contacts.map((s) => (
								<Card key={s.label}>
									<Link
										href={s.href}
										target="_blank"
										className="p-4 flex items-center gap-4 group transition-all duration-300"
									>
										<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-white group-hover:border-zinc-500 group-hover:bg-zinc-800/50 transition-all duration-300">
											{s.icon}
										</div>
										<div className="flex flex-col min-w-0">
											<span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
												{s.label}
											</span>
											<span className="text-sm font-medium text-zinc-300 group-hover:text-white truncate">
												{s.handle}
											</span>
										</div>
									</Link>
								</Card>
							))}
						</div>
					</div>

					{/* Right Column: Contact Form */}
					<div className="lg:col-span-7 w-full">
						<ContactForm />
					</div>
					
				</div>
			</div>
		</div>
	);
}

