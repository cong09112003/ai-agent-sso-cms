import { translateKeys } from '@utils';
import { useIntl } from 'react-intl';

export default function useTranslate() {
    const intl = useIntl();
    return Object.assign(intl, { formatKeys: (message, keys = []) => translateKeys(intl, message, keys) });
}
