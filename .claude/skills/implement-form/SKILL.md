---
name: implement-form
description: Build or modify forms in this CMS using Ant Design Form through the local kit (BaseForm, useBasicForm, TextField/SelectField/NumericField/AutoCompleteField/DatePickerField/BooleanField/CropImageField), including validation rules, server-side field errors, create/edit data mapping with useSaveBase, and modal forms. Use for any new form, a new field, or a validation change.
argument-hint: "<form / fields to build or change>"
---

# Implement a form

Form: $ARGUMENTS

Follow `.claude/rules/forms.md`. Reference implementations: `src/modules/customer/CustomerForm.js` (simple), `src/modules/app/AppForm.js` (larger), and `src/modules/app/AppTabs/permission/PermissionModal.js` (modal).

## Steps
1. **List the fields**: name (matching the backend payload key), type, required, length or range limits, options source (static `masterData`, or an API for `AutoCompleteField`), and default value in create mode.
2. **Choose the field component** for each field:
   | Need | Component |
   |---|---|
   | text / multiline text | `TextField` (`type="textarea"` for multiline) |
   | number / money | `NumericField` |
   | fixed options | `SelectField` + `translate.formatKeys(options, ['label'])` |
   | remote search | `AutoCompleteField` with `apiConfig={apiConfig.x.autocomplete}`, `useFetch={useFetch}`, `mappingOptions`, `searchParams` |
   | date / date range | `DatePickerField` with format constants; `DateRangePickerField` is not exported from `@components/cms`, so import it from `@components/cms/form/DateRangePickerField` |
   | switch / checkbox | `BooleanField` |
   | image upload | `CropImageField` |
   Check the component's props in `src/components/cms/form/` before using any prop you haven't seen in use.
3. **Write the form** with the standard signature `({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, isEditing })`:
   - `useBasicForm({ onSubmit, setIsChangedFormValues })` gives you `form`, `mixinFuncs`, and `onValuesChange`.
   - `<BaseForm id={formId} form={form} onFinish={handleSubmit} onValuesChange={onValuesChange}>`.
   - `useEffect(() => { form.setFieldsValue({ ...dataDetail }); }, [dataDetail]);` plus create-mode defaults inside `if (!isEditing)`.
   - Lay out with `<Card className="card-form" bordered={false}><Row gutter={10}><Col span={12}>…`, then `<div className="footer-card-form">{actions}</div>`.
   - Labels: `<FormattedMessage defaultMessage="Vietnamese label" />` or `translate.formatMessage(commonMessage.x)`.
4. **Validation**: use `required`, `maxLength`/`minLength`, and `rules={[{ pattern, message }, { validator }]}` on the field components. For cross-field rules, such as confirming a password, use Ant Design's `({ getFieldValue }) => ({ validator })` rule form. Don't add yup or zod.
5. **Data mapping** belongs in the save page's `useSaveBase` override (`prepareCreateData`/`prepareUpdateData`): convert dates, strip UI-only fields, and add `id` on update. In the form's `handleSubmit`, only strip fields and then `return mixinFuncs.handleSubmit(values)`, so server field errors (`data.data[{ field, message }]`) show on the inputs.
6. **Modal forms**: use your own `Form.useForm()`, submit through `useFetch`, call `form.resetFields()` on close or success (or use `destroyOnClose`), and show `loading` on the OK button.

## Validate
- ESLint hook is clean.
- Walk through the matrix: create mode with empty fields → required errors show; edit mode → values prefilled; server validation error → message on the field; success → notification and navigation back.
- `npm run build:dev` if you added new imports or files.

## Done when
- [ ] Every input has a label and the right field component.
- [ ] Required and limit rules match the backend contract.
- [ ] Create and edit payloads are shaped in `prepare*Data`.
- [ ] Submit shows loading and blocks double submit; errors are visible.
