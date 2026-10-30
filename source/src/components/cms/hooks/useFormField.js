const useFormField = ({ requiredMsg, placeholder, required, rules }) => {
    const getRequiredMsg = () => requiredMsg || 'Bắt buộc';

    const getPlaceHolder = () => {
        if (placeholder) return placeholder;
        return '';
    };

    const getRules = () => {
        const rulesList = [];
        if (required) {
            rulesList.push({
                required,
                validator: (_, value) => {
                    const changeValue = typeof value === 'string' ? value.trim() : String(value).trim();
                    if (value === null || value === undefined || changeValue === '') {
                        return Promise.reject(new Error(getRequiredMsg()));
                    }
                    return Promise.resolve();
                },
            });
        }
        return rulesList;
    };

    const mergeRules = (rulesA, rulesB) => [...rulesA, ...rulesB];

    return {
        placeholder: getPlaceHolder(),
        rules: mergeRules(getRules(), rules || []),
    };
};

export default useFormField;
