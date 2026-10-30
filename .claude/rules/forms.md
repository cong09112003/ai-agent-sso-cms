---
paths:
  - "source/src/modules/**/*Form.js"
  - "source/src/modules/**/*Modal.js"
  - "source/src/components/cms/form/**/*.js"
  - "source/src/hooks/useBasicForm.js"
  - "source/src/components/cms/hooks/useFormField.js"
---

# Forms and validation

- Forms use **Ant Design `Form`** through the local wrappers. React Hook Form, Formik, and Zod are not used. `yup` is installed but no code imports it, so don't introduce it.
- Standard form component signature (as passed by `useSaveBase` pages):
  `({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, isEditing })`.
  - `const { form, mixinFuncs, onValuesChange } = useBasicForm({ onSubmit, setIsChangedFormValues });`
  - `<BaseForm id={formId} form={form} onFinish={handleSubmit} onValuesChange={onValuesChange}>`. The save button in `actions` submits the form through `form={formId}`, so the id must match.
  - Load data with `useEffect(() => form.setFieldsValue({ ...dataDetail }), [dataDetail])`.
  - In `handleSubmit`, adjust the values (strip UI-only fields), then `return mixinFuncs.handleSubmit(values)`. That callback maps server field errors (`data.data[{ field, message }]`) onto the inputs.
  - Render `actions` inside the card footer (`<div className="footer-card-form">{actions}</div>`).
- Use the kit's fields: `TextField`, `NumericField`, `SelectField`, `AutoCompleteField` (pass `useFetch={useFetch}` and an `apiConfig`), `DatePickerField`, `BooleanField`, `CropImageField`. The wrappers already handle `required` and `requiredMsg`, `maxLength`/`minLength`, placeholders, and Vietnamese default messages. Pass extra rules through `rules=[...]` (Ant Design rule objects). Don't hand-roll `Form.Item` + `Input` when a field component exists.
- Translate option arrays with `translate.formatKeys(options, ['label'])`. Shared option lists such as `statusOptions` live in `@constants/masterData`.
- Shape outgoing data in the page's `useSaveBase` override (`funcs.prepareCreateData` / `funcs.prepareUpdateData`), not in the form. Edit payloads usually need `id: detail.id`.
- Dates: use `dayjs` with the format constants in `@constants` (`DATE_FORMAT_VALUE`, `DEFAULT_FORMAT`, ...) and convert to the backend format in `prepare*Data`.
- Modal forms (`*Modal.js`) use their own `Form.useForm()` and `useFetch` calls. Reset the form when the modal closes.
