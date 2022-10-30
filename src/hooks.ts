import { RefObject, useEffect, useRef } from 'react'

import { off, on } from './utils'

export const usePlacesScript = (onLoad: () => void, onError?: () => void) => {
	const api_key = process.env.PAYLOAD_PUBLIC_GOOGLE_MAPS_KEY
	if (!api_key) {
		throw new Error('Google maps requires PAYLOAD_PUBLIC_GOOGLE_MAPS_KEY environment variable')
	}
	const url = `https://maps.googleapis.com/maps/api/js?key=${api_key}&libraries=places`

	useEffect(() => {
		let script = document.querySelector(`script[src="${url}"]`) as HTMLScriptElement

		const handleScript = (e: any) => {
			if (e.type === 'load') {
				onLoad()
			}
			if (e.type === 'error' && onError) {
				onError()
			}
		}

		if (!script) {
			script = document.createElement('script')
			script.type = 'application/javascript'
			script.src = url
			script.async = true
			document.body.appendChild(script)
			script.addEventListener('load', handleScript)
			script.addEventListener('error', handleScript)
		}

		script.addEventListener('load', handleScript)
		script.addEventListener('error', handleScript)

		return () => {
			script.removeEventListener('load', handleScript)
			script.removeEventListener('error', handleScript)
		}
	}, [url])
}

const defaultEvents = ['mousedown', 'touchstart']

export const useClickAway = <E extends Event = Event>(
	ref: RefObject<HTMLElement | null>,
	onClickAway: (event: E) => void,
	events: string[] = defaultEvents
) => {
	const savedCallback = useRef(onClickAway)
	useEffect(() => {
		savedCallback.current = onClickAway
	}, [onClickAway])
	useEffect(() => {
		const handler = (event: any) => {
			const { current: el } = ref
			el && !el.contains(event.target) && savedCallback.current(event)
		}
		for (const eventName of events) {
			on(document, eventName, handler)
		}
		return () => {
			for (const eventName of events) {
				off(document, eventName, handler)
			}
		}
	}, [events, ref])
}
