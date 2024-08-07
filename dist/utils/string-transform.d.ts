type Indexes<T = any> = {
    [s: string | number]: T;
};
/**
 * 字符串 token 转对象
 */
export declare function parseCookies(cookieString: string): {
    [key: string]: string;
};
/**
 * 对象转url查询参数
 * @returns '&a=1&b=2'
 */
export declare function objectToQueryString(params: Indexes): string;
/**
 * 复制内容
 * @param {string} value 需要复制的内容
 * @param {Function} cb 复制成功回调函数
 */
export declare function copyText(value: string, cb?: Function): void;
/**
 * base64 加密
 */
export declare function base64UrlEncode(str: string): string;
/**
 * base64 解密
 */
export declare function decodeFromBase64Url(base64UrlStr: string): string;
export {};
