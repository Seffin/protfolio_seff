"use client";

import { useState } from "react";
import { GoMail, GoPerson, GoCheck } from "react-icons/go";

export function ContactForm() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		message: "",
	});
	const [status, setStatus] = useState("idle"); // idle, loading, success, error
	const [errorMessage, setErrorMessage] = useState("");
	const [fallbackMailto, setFallbackMailto] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.name || !formData.email || !formData.message) {
			setStatus("error");
			setErrorMessage("Please fill out all fields.");
			return;
		}

		setStatus("loading");
		setErrorMessage("");

		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			const data = await res.json();

			if (!res.ok || data.error) {
				setStatus("error");
				setErrorMessage(data.error || "Failed to send message. Please try again.");
				return;
			}

			if (data.mailtoUrl) {
				setFallbackMailto(data.mailtoUrl);
			}

			setStatus("success");
			setFormData({ name: "", email: "", message: "" });
		} catch (error) {
			console.error("Submission error:", error);
			setStatus("error");
			setErrorMessage("A network error occurred. Please try again or email directly.");
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		if (status === "error") {
			setStatus("idle");
			setErrorMessage("");
		}
	};

	if (status === "success") {
		return (
			<div className="flex flex-col items-center justify-center p-8 text-center bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-800 h-full min-h-[400px] duration-500">
				<div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6 animate-bounce">
					<GoCheck size={32} />
				</div>
				<h3 className="text-2xl font-semibold text-zinc-100 mb-2">Message Received!</h3>
				<p className="text-zinc-400 max-w-sm mb-6 text-sm">
					Thank you for reaching out! Your message has been recorded. I'll get back to you as soon as possible.
				</p>
				<div className="flex flex-col sm:flex-row gap-3">
					{fallbackMailto && (
						<a
							href={fallbackMailto}
							target="_blank"
							rel="noopener noreferrer"
							className="px-5 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium transition-all duration-300 text-sm flex items-center justify-center gap-2"
						>
							<GoMail className="w-4 h-4" /> Send via Mail App
						</a>
					)}
					<button
						onClick={() => {
							setStatus("idle");
							setFallbackMailto("");
						}}
						className="px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 transition-all duration-300 text-sm font-medium"
					>
						Send another message
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full bg-zinc-900/35 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-zinc-800/80 shadow-2xl relative overflow-hidden">
			{/* Glow effect */}
			<div className="absolute top-0 right-0 -tranzinc-y-1/2 w-48 h-48 bg-zinc-500/5 rounded-full blur-3xl pointer-events-none" />
			
			<h3 className="text-xl font-semibold text-zinc-100 mb-6 font-display">Send a Message</h3>
			
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Name input */}
				<div className="relative">
					<span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
						<GoPerson size={18} />
					</span>
					<input
						type="text"
						name="name"
						id="name"
						required
						value={formData.name}
						onChange={handleChange}
						placeholder="Your Name"
						className="block w-full pl-10 pr-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all duration-300 text-sm"
					/>
				</div>

				{/* Email input */}
				<div className="relative">
					<span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
						<GoMail size={18} />
					</span>
					<input
						type="email"
						name="email"
						id="email"
						required
						value={formData.email}
						onChange={handleChange}
						placeholder="your.email@example.com"
						className="block w-full pl-10 pr-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all duration-300 text-sm"
					/>
				</div>

				{/* Message input */}
				<div>
					<textarea
						name="message"
						id="message"
						rows={4}
						required
						value={formData.message}
						onChange={handleChange}
						placeholder="How can I help you?"
						className="block w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all duration-300 text-sm resize-none"
					/>
				</div>

				{status === "error" && (
					<p className="text-sm text-rose-500">{errorMessage || "Please fill out all fields correctly."}</p>
				)}

				<button
					type="submit"
					disabled={status === "loading"}
					className="w-full relative group overflow-hidden py-3 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
				>
					{status === "loading" ? (
						<>
							<span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
							Sending...
						</>
					) : (
						"Send Message"
					)}
				</button>
			</form>
			<p className="mt-4 text-xs text-center text-zinc-500">
				Responses will be sent to your email address.
			</p>
		</div>
	);
}
