/*!
 * V4Fire Malevich
 * https://github.com/V4Fire/Malevich
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Malevich/blob/master/LICENSE
 */

- namespace [%fileName%]

- include 'base/b-header/b-header.mono.ss'|b
- include 'super/i-dynamic-page'|b as placeholder

- template index() extends ['i-dynamic-page'].index
	- block body
		+= self.getTpl('b-header/')()

		< .&__content
			< template v-if = stage === 'commit'
				< .&__file-info
					< .&__file-name v-if = fileInfo('name')
						{{ field.get('dsInfo.file.name') }}

					< .&__file-last-modified v-if = fileInfo('lastModified')
						Last Modified {{ fileInfo('lastModified') }}

					< .&__file-version v-if = fileInfo('version')
						File version {{ fileInfo('version') }}

				< b-image.&__thumbnail :src = fileInfo('thumbnailUrl')

				< h3.&__form-title
					Update package

				< b-form &
					:classes = provide.classes({form: true}) |
					:dataProvider = 'publish.Git' |
					:method = 'post' |
					@onSubmitSuccess = router.push('/')
				.
					< b-input-hidden &
						:name = 'endpoint' |
						:value = 'commit'
					.

					< b-input &
						:name = 'message' |
						:placeholder = 'Type a commit message' |
						:width = 'full' |
						:validators = [['required', {showMsg: false}]] |
						@onValidationEnd = onValidationEnd
					.

					< b-button.&__commit-submit &
						ref = formSubmit |
						:type = 'submit' |
						:exterior = 'dark' |
						:disabled = true
					.
						Save changes

			< template v-else
				< b-form &
					v-once |
					ref = files |
					:id = dom.getId('fileForm') |
					:method = 'get' |
					:dataProvider = 'adapter.FigmaFiles' |
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
						:exterior = 'dark' |
						:name = 'file' |
						:disabled = true
					.
						Create Design System
