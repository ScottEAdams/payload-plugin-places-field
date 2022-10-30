import React, { useRef, useState } from 'react'
import Select from 'react-select'
import { useFormFields } from 'payload/components/forms'
import Error from 'payload/dist/admin/components/forms/Error'
import Label from 'payload/dist/admin/components/forms/Label'
import useField from 'payload/dist/admin/components/forms/useField'
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete'
import { Props } from 'payload/components/fields/Text'

import { useClickAway, usePlacesScript } from '../hooks'

import 'payload/dist/admin/components/elements/ReactSelect/index.scss'
import './PlacesField.scss'
import invariant from 'tiny-invariant'

const PlacesField: React.FC<Props> = ({ path, label, required }) => {
	invariant(path, 'No path provided')
	const { value, showError, setValue, errorMessage } = useField<string>({ path })
	const dispatchPoint = useFormFields(([_, dispatch]) => dispatch)

	const {
		init,
		ready,
		value: placeValue,
		suggestions: { status, data },
		setValue: setPlaceValue,
		clearSuggestions
	} = usePlacesAutocomplete({
		initOnMount: false,
		defaultValue: value
	})

	usePlacesScript(() => {
		init()
	})

	const [menuIsOpen, setMenuIsOpen] = useState(false)

	const ref = useRef()
	useClickAway(ref, () => {
		setMenuIsOpen(false)
		clearSuggestions()
	})

	const handleInput = (e) => {
		setPlaceValue(e.target.value)
		setValue(e.target.value)
	}

	const handleSelect = ({ suggestion }) => {
		setMenuIsOpen(false)
		setPlaceValue(suggestion?.description, false)
		setValue(suggestion?.description)
		clearSuggestions()

		getGeocode({ placeId: suggestion.place_id }).then((results) => {
			const { lat, lng } = getLatLng(results[0])
			dispatchPoint({
				type: 'UPDATE',
				path: `${path}_point`,
				value: [lng, lat]
			})
		})
	}

	const classes = ['react-select', showError && 'react-select--error'].filter(Boolean).join(' ')

	const getSuggestions = () => {
		if (data && status === 'OK') {
			return data.map((suggestion) => {
				const {
					place_id,
					structured_formatting: { main_text, secondary_text }
				} = suggestion
				return { value: place_id, label: `${main_text} ${secondary_text}`, suggestion: suggestion }
			})
		} else {
			return []
		}
	}

	return (
		<div ref={ref} className={'field-type place'}>
			<Error showError={showError} message={errorMessage} />
			<Label htmlFor={path} label={label} required={required} />
			<input
				id={`field-${path.replace(/\./gi, '__')}`}
				value={value || ''}
				onChange={handleInput}
				disabled={!ready}
				type='text'
				name={path}
				onFocus={() => setMenuIsOpen(true)}
			/>
			<Select
				placeholder=''
				value={placeValue}
				onChange={handleSelect}
				disabled={!ready ? 'disabled' : undefined}
				noOptionsMessage={() => null}
				className={classes}
				classNamePrefix='rs'
				options={getSuggestions()}
				menuIsOpen={menuIsOpen}
				closeMenuOnSelect={true}
			/>
		</div>
	)
}

export default PlacesField
