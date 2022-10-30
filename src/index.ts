import { PointField, TextField } from 'payload/types'

import PlacesField from './fields/PlacesField'

export const placesFields = (options: Omit<TextField, 'type'>): [TextField, PointField] => {
	return [
		{
			type: 'text',
			admin: {
				components: {
					Field: (props) => {
						return PlacesField({
							...props
						})
					}
				}
			},
			...options
		},
		{
			name: `${options.name}_point`,
			label: `${options.label || options.name}`,
			type: 'point',
			admin: {
				hidden: true
			}
		}
	]
}
