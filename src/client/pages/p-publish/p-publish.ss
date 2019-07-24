/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

- namespace [%fileName%]

- include 'super/i-dynamic-page'|b as placeholder

- template index() extends ['i-dynamic-page'].index
	- block body
		< .&__content
			< template v-if = stage === 'commit'
				< b-image.&__thumbnail :src = fileInfo('thumbnailUrl')

				< .&__file-info
					< .&__file-name v-if = fileInfo('name')
						{{ field.get('dsInfo.file.name') }}

					< .&__file-last-modified v-if = fileInfo('lastModified')
						Last Modified {{ fileInfo('lastModified').format('d;M:2-digit;Y h;m;s') }}

					< .&__file-version v-if = fileInfo('version')
						File version {{ fileInfo('version') }}

				< b-form :classes = provide.classes({form: true})
					< b-input &
						:name = 'tag' |
						:width = 'full' |
						:placeholder = field.get('repo.tag') || 'Type tag version'
					.

					< b-textarea &
						:name = 'message' |
						:placeholder = 'Type a commit message' |
						:width = 'full' |
						:validators = [['required', {showMsg: false}]] |
						@onValidationEnd = onValidationEnd
					.

					< b-button.&__commit-submit &
						ref = formSubmit |
						:type = 'submit' |
						:name = 'file' |
						:disabled = true
					.
						Save changes


			< template v-else
				< b-form &
					v-once |
					ref = files |
					:id = dom.getId('fileForm') |
					:method = 'get' |
					:dataProvider = 'API.FigmaFiles' |
					@onSubmitSuccess = onPublishSuccess
				.

					< b-input &
						:name = 'id' |
						:validators = [['required', {showMsg: false}]] |
						:placeholder = 'Enter a file key' |
						@onValidationEnd = onValidationEnd
					.

					< b-button &
						ref = formSubmit |
						:type = 'submit' |
						:name = 'file' |
						:disabled = true
					.
						Create Design System
