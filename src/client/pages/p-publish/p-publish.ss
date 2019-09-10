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

		< template v-if = stage === 'preview'
			< template v-if = data
				< .&__errors v-if = Boolean(field.get('data.errors.length'))
					< .&__error v-for = el in data.errors
						{{ el.name }}, {{ el.description }}

				< b-showcase &
					v-else |
					:diff = data.diff |
					:data = data.designSystem
				.

				< .&__control-panel
					< b-form.&__form-component &
						:classes = provide.classes({form: true}) |
						:dataProvider = 'publish.Git' |
						:method = 'post' |
						@onSubmitSuccess = onCommitFormSubmitSuccess
					.
						< b-input-hidden &
							:name = 'endpoint' |
							:value = 'commit'
						.

						< b-input &
							v-func = false |
							:key = :name, 'message' |
							:placeholder = 'Type a commit message' |
							:classes = provide.classes({wrapper: 'input'}) |
							:validators = [['required', {showMsg: false}]] |
							@onValidationEnd = onValidationEnd
						.

						< b-button.&__commit-submit &
							ref = formSubmit |
							:classes = provide.classes({button: 'commit-button'}) |
							:type = 'submit' |
							:disabled = true
						.
							Save changes

					< b-button.&__control-panel-btn &
						:classes = provide.classes({button: 'reject-button'}) |
						@click = onResetChanges
					.
						Cancel

		< template v-else
			< .&__content
				< b-form &
					:dataProvider = 'convert.Adapters' |
					:method = 'get' |
					@onSubmitSuccess = onPublishSuccess
				.
					< b-input-hidden &
						:name = 'service' |
						:value = 'figma'
					.

					< b-input &
						v-func = false |
						:key = :name, 'file' |
						:classes = provide.classes({wrapper: 'input'}) |
						:validators = [['required', {showMsg: false}]] |
						:placeholder = 'Enter a file key' |
						@onValidationEnd = onValidationEnd
					.

					< b-button &
						v-func = false |
						ref = formSubmit |
						:classes = provide.classes({button: 'create-button'}) |
						:type = 'submit' |
						:rounding = 'small' |
						:disabled = true
					.
						Create Design System
