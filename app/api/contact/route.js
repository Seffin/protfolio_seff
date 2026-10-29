import data from "../../../data.json";

export async function POST(request) {
	try {
		const body = await request.json();
		const { name, email, message } = body;

		if (!name || !email || !message) {
			return Response.json(
				{ error: "Name, email, and message are required." },
				{ status: 400 }
			);
		}

		// Basic email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return Response.json(
				{ error: "Please provide a valid email address." },
				{ status: 400 }
			);
		}

		const recipientEmail = data.email || "seffintommathew@gmail.com";
		const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(
			`Portfolio Contact: Message from ${name}`
		)}&body=${encodeURIComponent(
			`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
		)}`;

		// 1. Check for Web3Forms Access Key
		const web3formsKey = process.env.WEB3FORMS_KEY || process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
		if (web3formsKey) {
			try {
				const res = await fetch("https://api.web3forms.com/submit", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
					},
					body: JSON.stringify({
						access_key: web3formsKey.trim(),
						name,
						email,
						message,
						subject: `New Portfolio Message from ${name}`,
						from_name: `${name} (Portfolio Contact)`,
					}),
				});

				const rawText = await res.text();
				let result = null;
				try {
					result = JSON.parse(rawText);
				} catch {
					// Datacenter IPs on Vercel are challenged by Cloudflare; client-side browser submission handles it directly
				}

				if (result?.success) {
					return Response.json({ success: true, provider: "web3forms" });
				}
			} catch (fetchErr) {
				console.warn("Server Web3Forms call bypassed:", fetchErr.message);
			}
		}

		// 2. Check for Resend API Key
		const resendApiKey = process.env.RESEND_API_KEY;
		if (resendApiKey) {
			const res = await fetch("https://api.resend.com/emails", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${resendApiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					from: "Portfolio Contact <onboarding@resend.dev>",
					to: [recipientEmail],
					reply_to: email,
					subject: `New Portfolio Message from ${name}`,
					text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
				}),
			});

			if (res.ok) {
				return Response.json({ success: true, provider: "resend" });
			} else {
				const err = await res.text();
				console.error("Resend API error:", err);
			}
		}

		// 3. Fallback: Log message on server and return mailto URL for direct send
		console.log("📬 [Contact Form Submission Received]");
		console.log(`From: ${name} <${email}>`);
		console.log(`Message: ${message}`);

		return Response.json({
			success: true,
			provider: "fallback",
			mailtoUrl,
			message: "Message logged. Set WEB3FORMS_KEY or RESEND_API_KEY in .env.local for automatic email forwarding.",
		});
	} catch (error) {
		console.error("Contact API route error:", error);
		return Response.json(
			{ error: "Failed to send message. Please try again or reach out directly." },
			{ status: 500 }
		);
	}
}
