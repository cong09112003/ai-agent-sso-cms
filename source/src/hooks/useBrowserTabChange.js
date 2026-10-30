import { useEffect } from "react";

const useBrowserTabChange = (onHidden, onVisible) => {
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Khi người dùng chuyển sang tab khác hoặc thu nhỏ trình duyệt
                onHidden?.();
            } else {
                // Khi người dùng quay lại tab này
                onVisible?.();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [onHidden, onVisible]);
};

export default useBrowserTabChange;