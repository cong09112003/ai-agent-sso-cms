---
name: implement-page
description: Create or modify a CMS page and its routing in this project, typically a list page built on useListBase and a create/edit page built on useSaveBase, registered in the module's routes.js, src/routes/index.js, and optionally the side menu (menuConfig.js). Use when adding a new admin screen, changing columns, filters, or actions of a list, changing an edit page, or changing route paths, permissions, or breadcrumbs.
argument-hint: "<entity or page, e.g. 'device list + edit under customer'>"
---

# Implement or modify a page

Target: $ARGUMENTS

Read `.claude/rules/routing-and-permissions.md` and use `src/modules/customer/` as the reference implementation.

## A. List page (`src/modules/<feature>/index.js`)
1. `const { data, mixinFuncs, queryFilter, loading, pagination, changePagination } = useListBase({ apiConfig: apiConfig.<entity>, options: { objectName, pageSize: DEFAULT_TABLE_ITEM_SIZE }, override })`.
   - `apiConfig.<entity>` must have `getList`, plus `delete`, `update`, `getById`, and `changeStatus` for the built-in actions.
   - In `override(funcs)`, set `funcs.mappingData` if the response isn't `{ result, data: { content, totalElements } }`, `funcs.prepareGetListParams` to adapt filters, `funcs.additionalActionColumnButtons` for extra row buttons (wrap them in `BaseTooltip`), and `funcs.getItemDetailLink`/`getCreateLink` for non-default paths.
   - Use `isProjectToken: true` only for endpoints that require the per-app token. It also skips the create and delete permission checks.
2. Columns: an index column `orderNumber(pagination, index)`, data columns with `<FormattedMessage defaultMessage="..." />` titles, then `mixinFuncs.renderStatusColumn(...)` and `mixinFuncs.renderActionColumn({ edit: true, delete: true }, { width })`. Call `.filter(Boolean)` on the array if columns are conditional.
3. Search: `const searchFields = [{ key, placeholder, type?: FieldTypes.SELECT, options? }]`, with `FieldTypes` imported from `@constants/formConfig` as existing pages do. An omitted `type` renders a text input. with `mixinFuncs.renderSearchForm({ fields: searchFields, initialValues: queryFilter })`. Filters sync to the URL query automatically.
4. Render `<PageWrapper routes={breadcrumbs}><ListPage searchForm actionBar={mixinFuncs.renderActionBar()} baseTable={<BaseTable ... rowKey={(r) => r.id} />} /></PageWrapper>`.

## B. Save page (`<Entity>SavePage.js`)
1. `useSaveBase({ apiConfig: { getById, create, update }, options: { getListUrl: routes.<list>.path, objectName }, override })`.
   - In the override, set `funcs.prepareCreateData` / `funcs.prepareUpdateData` (include `id: detail.id` on update) and `funcs.mappingData` if the detail response is unusual.
2. Render `<PageWrapper routes={[{ breadcrumbName: objectName, path: listPath }, { breadcrumbName: title }]}>` with the form, passing `formId={mixinFuncs.getFormId()}`, `actions={mixinFuncs.renderActions()}`, `onSubmit={mixinFuncs.onSave}`, `dataDetail={detail || {}}`, `isEditing`, and `setIsChangedFormValues`. Build the form with `/implement-form`.

## C. Routing
1. In `src/modules/<feature>/routes.js`, add entries with `path` (list `/x`, save `/x/:id`), `component`, `auth: true`, and `permission: [apiConfig.x.getList.permissionCode]`. Use **`permission`**, singular; the plural form is silently ignored.
   - For a save page whose create and update permissions differ: `separateCheck: true, permission: [createCode, updateCode]`.
2. A new module's routes must be spread into `src/routes/index.js` **before** `notFound`.
3. Link to the pages with `generatePath(routes.<key>.path, { id })`. Route keys are global across modules, so pick a unique key name.

## D. Menu (optional)
Add a child to the right group in `src/constants/menuConfig.js`: `{ label: <FormattedMessage defaultMessage="..." />, key, path: routes.<key>.path, permission: [apiConfig.<entity>.getList.permissionCode] }`. Remember that the first visible menu item is the post-login landing page.

## Validate
- ESLint hook is clean; then `npm run build:dev` from `source/` to catch broken imports or route references (for example, `modules/customer` references a `routes.DeviceListPage` that doesn't exist; don't add more dangling route references like that).
- Manually check against the route config: `auth`, permission codes, breadcrumbs, the create path `/x/create`, and the back-to-list URL.

## Done when
- [ ] The list loads with pagination and filters in the URL, and delete/status/edit actions show only when the user has permission.
- [ ] The create and edit pages work, including the `create` id, the success notification, and the redirect back to the list.
- [ ] Routes are registered before `notFound`; a menu entry exists if requested.
- [ ] `npm run build:dev` passes, or you explain why it couldn't run.
