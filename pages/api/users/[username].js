const users = async (req, res) => {

	const { username } = req.query;
	const headers = process.env.GH_TOKEN && process.env.GH_TOKEN.trim()
		? { Authorization: `Bearer ${process.env.GH_TOKEN}` }
		: {};

	const response = await fetch('https://api.github.com/users/' + username, {
		headers,
	});
	const data = await response.json();

	return res.status(200).json(data);
};

export default users;
