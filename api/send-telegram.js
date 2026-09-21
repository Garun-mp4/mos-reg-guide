export default async function handler(req, res) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', 'POST')
		return res.status(405).json({ ok: false, message: 'Method not allowed' })
	}

	res.setHeader('Cache-Control', 'no-store')

	const token = process.env.TELEGRAM_BOT_TOKEN
	const chatId = process.env.TELEGRAM_CHAT_ID

	if (!token || !chatId) {
		return res.status(500).json({
			ok: false,
			message: 'Telegram is not configured',
		})
	}

	const body = req.body && typeof req.body === 'object' ? req.body : {}

	// Silently accept obvious bot submissions without forwarding them to Telegram.
	if (typeof body.website === 'string' && body.website.trim()) {
		return res.status(200).json({ ok: true })
	}

	const text = typeof body.text === 'string' ? body.text.trim() : ''

	if (!text) {
		return res.status(400).json({ ok: false, message: 'Message text is empty' })
	}

	if (text.length > 3900) {
		return res.status(400).json({ ok: false, message: 'Message text is too long' })
	}

	let response

	try {
		response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				chat_id: chatId,
				text,
				disable_web_page_preview: true,
			}),
		})
	} catch {
		return res.status(502).json({
			ok: false,
			message: 'Telegram request failed',
		})
	}

	const result = await response.json().catch(() => ({}))

	if (!response.ok || result.ok === false) {
		return res.status(502).json({
			ok: false,
			message: result.description || 'Telegram request failed',
		})
	}

	return res.status(200).json({ ok: true })
}
