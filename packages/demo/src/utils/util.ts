import { ElMessage } from 'element-plus';
import { load, hashComponents } from '@fingerprintjs/fingerprintjs';
import { autoLogin } from '@/api/login';

export function emptyIs(val: any) {
    if (val == null) {
        return true;
    }
    return val == '';

}

export function arraySwap(arr: any[], from: number, to: number) {
    const obj = arr[from];
    arr[from] = arr[to];
    arr[to] = obj;
}

export function msgSuccess(msg: string) {
    ElMessage({
        message: msg,
        type: 'success'
    });
}

export function msgError(msg: string) {
    ElMessage.error(msg);
}

let visitorId = null;
let token = null;

export function getVisitorId() {
    return visitorId ?? '-1';
}

export function getToken() {
    return token ?? '-1';
}

export function initVisitorId() {
    visitorId = window.localStorage.getItem('visitorId');
    token = window.localStorage.getItem('token');
    if (visitorId != null && token != null) {
        return;
    }
    if (visitorId == null) {
        const fpPromise = load();

        fpPromise
            .then(fp => fp.get())
            .then(result => {
                const { fonts, languages, audio, ...components } = result.components;
                // Add a few custom components
                const extendedComponents = {
                    canvas: components.canvas,
                    audioBaseLatency: components.audioBaseLatency,
                    forcedColors: components.forcedColors,
                    math: components.math,
                    osCpu: components.osCpu,
                    vendor: components.vendor,
                    platform: components.platform,
                    touchSupport: components.touchSupport,
                    deviceMemory: components.deviceMemory,
                    cpuClass: components.cpuClass,
                    applePay: components.applePay
                };
                // 这个唯一ID
                visitorId = hashComponents(extendedComponents);
                window.localStorage.setItem('visitorId', visitorId);

                autoLogin({ visitorId })
                    .then(res => {
                        token = res.data.token;
                        window.localStorage.setItem('token', res.data.token);
                    });
                // console.log(visitorId);
                // 可以将visitorId发送到服务器或用于其他用途
            })
            .catch(error => console.error(error));
    } else {
        autoLogin({ visitorId })
            .then(res => {
                token = res.data.token;
                window.localStorage.setItem('token', res.data.token);
            });
    }
}
