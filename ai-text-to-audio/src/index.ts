import { FieldType, fieldDecoratorKit, FormItemComponent, FieldExecuteCode, AuthorizationType } from 'dingtalk-docs-cool-app';
const { t } = fieldDecoratorKit;

// 通过addDomainList添加请求接口的域名
fieldDecoratorKit.setDomainList(['base-api.aimaxhug.com', 'jia-test.aimaxhug.com', 'stag-base-api.aimaxhug.com']);

// ==================== 1. 基础配置与工具模块 ====================
import { v4 as uuidv4 } from 'uuid';

const ENV_CONFIG = {
    PROD: 'https://base-api.aimaxhug.com/api/v2/text-to-audio/speech',
    LOCAL: 'http://jia-test.aimaxhug.com:3200/api/v2/text-to-audio/speech'
} as const;
const USE_ENV = 'PROD' as keyof typeof ENV_CONFIG;
const SERVICE_URL = ENV_CONFIG[USE_ENV];

fieldDecoratorKit.setDecorator({
    name: 'AI 文字转语音（TTS）https://www.aimaxhug.com',
    // 定义捷径的i18n语言资源
    i18nMap: {
        'zh-CN': {
            'pluginName': 'AI 文字转语音（TTS）',
            'promptLabel': '需合成的文本',
            'promptPlaceholder': '请输入需要合成的文本内容',
            'modelLabel': '模型名称',
            'modelPlaceholder': '默认 speech-2.8-hd',
            'sysPromptLabel': '音色与提示词',
            'sysPromptPlaceholder': '例：请使用  南方小哥 音色，并根据内容给语音配置合理的语速、语调',
            'fileLabel': '参考音频',
            'filePlaceholder': '请选择克隆语音的原始音频',
            'fileTips': '支持 mp3、wav等常见音频格式，上传参考音频后，则【音色与提示词】不会生效',
            'inferenceLabel': '模型推理语气',
            'speedLabel': '语速',
            'speedPlaceholder': '取值范围 0.5~2，默认 1.0',
            'volLabel': '音量',
            'volPlaceholder': '取值范围 0~10，默认 1.0',
            'pitchLabel': '语调',
            'pitchPlaceholder': '取值范围 -12~12，默认 0',
            'emotionLabel': '情绪',
            'emotionPlaceholder': '请选择合成语音的情绪基调',
            'apiKeyPlaceholder': '请输入您的 API Key (例如: Bearer xxx)',
            // 错误提示
            'err_format': '后端服务器返回了无效的响应格式',
            'err_no_url': '未获取到生成的音频地址',
            'err_400': '请求参数错误，请检查输入内容',
            'err_401': '认证失败，请检查 API Key',
            'err_403': '无权限访问',
            'err_500': '服务器内部错误',
            'err_unknown': '服务器返回未知异常',
            'err_service': '服务执行异常，请稍后重试'
        },
        'en-US': {
            'pluginName': 'AI Text-to-Speech (TTS)',
            'promptLabel': 'Text to Synthesize',
            'promptPlaceholder': 'Enter the text content to synthesize',
            'modelLabel': 'Model Name',
            'modelPlaceholder': 'Default: speech-2.8-hd',
            'sysPromptLabel': 'System Prompt',
            'sysPromptPlaceholder': 'e.g., "Speak in a gentle tone"',
            'fileLabel': 'Reference Audio',
            'filePlaceholder': 'Upload reference audio for timbre matching',
            'fileTips': 'Supports mp3, wav and other common audio formats',
            'inferenceLabel': 'Model Inference Tone',
            'speedLabel': 'Speed',
            'speedPlaceholder': 'Range 0.5~2, default 1.0',
            'volLabel': 'Volume',
            'volPlaceholder': 'Range 0~10, default 1.0',
            'pitchLabel': 'Pitch',
            'pitchPlaceholder': 'Range -12~12, default 0',
            'emotionLabel': 'Emotion',
            'emotionPlaceholder': 'Select emotion',
            'apiKeyPlaceholder': 'Enter API Key (e.g., Bearer xxx)',
            'err_format': 'Invalid response format from server',
            'err_no_url': 'Failed to get the generated audio URL',
            'err_400': 'Request parameter error',
            'err_401': 'Authentication failed',
            'err_403': 'Access denied',
            'err_500': 'Internal server error',
            'err_unknown': 'Unknown server error',
            'err_service': 'Service execution exception'
        },
        'ja-JP': {
            'pluginName': 'AIテキスト読み上げ（TTS）',
            'promptLabel': '合成テキスト',
            'promptPlaceholder': '音声合成するテキストを入力',
            'modelLabel': 'モデル名',
            'modelPlaceholder': 'デフォルト: speech-2.8-hd',
            'sysPromptLabel': 'システムプロンプト',
            'sysPromptPlaceholder': '例：「優しい口調で話して」',
            'fileLabel': '参照オーディオ',
            'filePlaceholder': '音色合わせのための参照オーディオをアップロード',
            'fileTips': 'mp3、wavなど一般的な形式に対応',
            'inferenceLabel': 'モデル推論トーン',
            'speedLabel': '速度',
            'speedPlaceholder': '範囲 0.5~2、デフォルト 1.0',
            'volLabel': '音量',
            'volPlaceholder': '範囲 0~10、デフォルト 1.0',
            'pitchLabel': 'ピッチ',
            'pitchPlaceholder': '範囲 -12~12、デフォルト 0',
            'emotionLabel': '感情',
            'emotionPlaceholder': '感情を選択',
            'apiKeyPlaceholder': 'APIキーを入力してください',
            'err_format': 'サーバーからの応答形式が無効です',
            'err_no_url': '生成された音声URLを取得できませんでした',
            'err_400': 'リクエストパラメータのエラーです',
            'err_401': '認証に失敗しました',
            'err_403': 'アクセス権限がありません',
            'err_500': 'サーバー内部エラーが発生しました',
            'err_unknown': '不明なサーバーエラー',
            'err_service': 'サービスの実行中に例外が発生しました'
        }
    },

    // 定义错误信息集合（映射到 i18n 资源）
    errorMessages: {
        'INVALID_FORMAT': t('err_format'),
        'NO_AUDIO_URL': t('err_no_url'),
        'ERROR_400': t('err_400'),
        'ERROR_401': t('err_401'),
        'ERROR_403': t('err_403'),
        'ERROR_500': t('err_500'),
        'ERROR_UNKNOWN': t('err_unknown'),
        'ERROR_SERVICE': t('err_service'),
    },

    formItems: [
        {
            key: 'fileText',
            label: t('promptLabel'),
            component: FormItemComponent.FieldSelect,
            props: {
                supportTypes: [FieldType.Attachment, FieldType.Text]
            },
            validator: { required: true },
            tooltips: { title: '支持文本或txt格式的文本附件。未上传参考音频时，最多支持10000字符内容；上传参考音频后最多支持3000字符' }
        },
        {
            key: 'model',
            label: t('modelLabel'),
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: 'speech-2.8-hd',
                options: [
                    { key: 'speech-2.8-hd', title: 'speech-2.8-hd' },
                    { key: 'speech-2.8-turbo', title: 'speech-2.8-turbo' }
                ],
                placeholder: t('modelPlaceholder')
            },
            validator: { required: false }
        },
        {
            key: 'emotion',
            label: t('emotionLabel'),
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: '',
                options: [
                    { key: 'happy', title: '高兴' },
                    { key: 'sad', title: '悲伤' },
                    { key: 'angry', title: '愤怒' },
                    { key: 'fearful', title: '害怕' },
                    { key: 'disgusted', title: '厌恶' },
                    { key: 'surprised', title: '惊讶' },
                    { key: 'calm', title: '中性' },
                    { key: 'fluent', title: '生动' },
                    { key: 'whisper', title: '低语' }
                ],
                placeholder: t('emotionPlaceholder')
            },
            validator: { required: false }
        },
        {
            key: 'sysPrompt',
            label: t('sysPromptLabel'),
            component: FormItemComponent.Textarea,
            props: {
                placeholder: t('sysPromptPlaceholder'),
                enableFieldReference: true
            },
            validator: { required: false },
            tooltips: { title: '1.注意：上传参考音频后，则【音色与提示词】不会生效；2.可用音色请参考文档：https://zhikemax.feishu.cn/wiki/Ad3Gw5urkipgggkGrJWc6m6Snae' }
        },
        {
            key: 'file',
            label: t('fileLabel'),
            component: FormItemComponent.FieldSelect,
            props: {
                mode: 'multiple',
                supportTypes: [FieldType.Attachment]
            },
            validator: { required: false },
            tooltips: { title: t('fileTips') }
        },
        {
            key: 'speed',
            label: t('speedLabel'),
            component: FormItemComponent.Textarea,
            props: {
                placeholder: t('speedPlaceholder'),
                enableFieldReference: true
            },
            validator: { required: false }
        },
        {
            key: 'vol',
            label: t('volLabel'),
            component: FormItemComponent.Textarea,
            props: {
                placeholder: t('volPlaceholder'),
                enableFieldReference: true
            },
            validator: { required: false }
        },
        {
            key: 'pitch',
            label: t('pitchLabel'),
            component: FormItemComponent.Textarea,
            props: {
                placeholder: t('pitchPlaceholder'),
                enableFieldReference: true
            },
            validator: { required: false }
        },
        {
            key: 'inference',
            label: t('inferenceLabel'),
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: 'true',
                options: [
                    { key: 'false', title: '关闭' },
                    { key: 'true', title: '开启（推荐）' }
                ]
            },
            validator: { required: false }
        },
    ],

    resultType: {
        type: FieldType.Attachment,
    },

    authorizations: {
        id: 'aimaxhug_auth',
        platform: 'aimaxhug',
        type: AuthorizationType.HeaderBearerToken,
        required: true,
        instructionsUrl: "https://aimaxhug.com/",
        label: 'aimaxhug',
        tooltips: 'https://alidocs.dingtalk.com/i/nodes/NkDwLng8ZLy5rXjYfa7y9R15VKMEvZBY',
        icon: {
            light: 'https://yinshan-1300111615.cos.ap-chengdu.myqcloud.com/aimaxhug/logo.png',
            dark: 'https://yinshan-1300111615.cos.ap-chengdu.myqcloud.com/aimaxhug/logo.png'
        }
    },

    execute: async (context, formData) => {
        const logID = context.extensionId || createUniqueId('DD_task');
        debugLog('===001 钉钉执行开始 ===', { formData, baseId: context.baseId, sheetId: context.sheetId }, logID);

        try {
            const requestBody = buildRequestBody(formData, logID);

            const response = await context.fetch(
                SERVICE_URL,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                }, 'aimaxhug_auth');

            const result = await response.json();
            debugLog('===006 接收响应结果 ===', result, logID);

            const statusVal = (typeof result.status === 'number') ? result.status
                : (typeof result.code === 'number' ? result.code : undefined);

            if (!result || typeof result !== 'object' || typeof statusVal !== 'number') {
                return {
                    code: FieldExecuteCode.Error,
                    errorMessage: 'INVALID_FORMAT'
                };
            }

            if (statusVal !== 200) {
                let errKey = 'ERROR_UNKNOWN';
                switch (statusVal) {
                    case 400: errKey = 'ERROR_400'; break;
                    case 401: errKey = 'ERROR_401'; break;
                    case 403: errKey = 'ERROR_403'; break;
                    case 500: errKey = 'ERROR_500'; break;
                }
                return {
                    code: FieldExecuteCode.Error,
                    errorMessage: errKey
                };
            }

            const { audioUrl } = extractResponseData(result);
            if (!audioUrl) {
                return {
                    code: FieldExecuteCode.Error,
                    errorMessage: 'NO_AUDIO_URL'
                };
            }

            // 文件名处理逻辑
            const urlParts = audioUrl.split('/');
            const lastPart = urlParts[urlParts.length - 1];
            let fileName = (lastPart && lastPart.includes('.')) ? lastPart.split('?')[0] : `audio-${Date.now()}.mp3`;
            debugLog('===007 开始检查音频大小 ===', result, logID);

            debugLog('===008 执行完成 ===', result, logID);
            return {
                code: FieldExecuteCode.Success,
                data: [{ fileName: fileName, url: audioUrl, size: 8362, type: "audio" }],
            };

        } catch (error: any) {
            debugLog('=== 执行异常 ===', { error: error.message }, logID);
            return {
                code: FieldExecuteCode.Error,
                extra: {
                    logID: logID
                },
                errorMessage: 'ERROR_SERVICE'
            };
        }
    },
});

/************ 工具方法 (逻辑保持不变) *********************** */

const createUniqueId = (() => {
    return (prefix = 'dingding') => `${prefix}_${uuidv4()}`;
})();

function extractResponseData(result: any) {
    let audioUrl = null;
    if (result?.data && typeof result.data === 'object') {
        audioUrl = result.data.url || result.data.audioUrl || null;
    }
    return { audioUrl };
}

function debugLog(stepOrData: string | object, data?: any, logID?: string) {
    const now = new Date();
    const pad = (num: number): string => String(num).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    let logData: any = { timestamp, logID: logID || 'N/A' };
    if (typeof stepOrData === 'object') {
        logData = { ...logData, ...stepOrData };
    } else {
        logData.step = stepOrData;
        if (data !== undefined) logData.data = data;
    }
    console.log(JSON.stringify(logData));
}

function buildRequestBody(params: any, logID?: string) {
    const { model, fileText, sysPrompt, file, speed, vol, pitch, emotion, inference } = params;

    const getSelectValue = (fieldValue: any) => {
        if (!fieldValue) return null;
        if (typeof fieldValue === 'string') return fieldValue;
        return fieldValue.value || (Array.isArray(fieldValue) && fieldValue[0]?.value) || null;
    };

    const getBoolValue = (fieldValue: any) => {
        if (fieldValue === null || fieldValue === undefined) return false;
        if (typeof fieldValue === 'boolean') return fieldValue;
        if (typeof fieldValue === 'string') return fieldValue === 'true';
        if (typeof fieldValue === 'object') {
            const val = fieldValue.value || fieldValue.key;
            return val === true || val === 'true';
        }
        return false;
    };

    const processAttachments = (fieldValue: any) => {
        if (!fieldValue) return [];
        const items = Array.isArray(fieldValue) ? (Array.isArray(fieldValue[0]) ? fieldValue.flat() : fieldValue) : [fieldValue];
        return items
            .filter(item => item && item.tmp_url)
            .map(item => ({
                tmp_url: item.tmp_url,
                name: item.name || '',
                type: item.type || '',
                size: item.size || 0
            }));
    };

    const requestBody: any = {
        model: getSelectValue(model) || 'speech-2.8-hd'
    };

    // 处理 fileText：文本或附件
    if (fileText) {
        if (Array.isArray(fileText)) {
            // 检查第一个元素的类型
                // 附件类型
            const files = processAttachments(fileText);
            if (files.length > 0) {
                requestBody.fileText = files;
            }
        } else if (typeof fileText === 'string') {
            // 纯字符串
            requestBody.prompt = fileText.trim();
        }
    }
    if (sysPrompt && sysPrompt.trim()) {
        requestBody.sysPrompt = sysPrompt.trim();
    }

    const fileAttachments = processAttachments(file);
    if (fileAttachments.length > 0) {
        requestBody.file = fileAttachments;
    }

    const speedVal = parseFloat(speed);
    if (!isNaN(speedVal)) {
        requestBody.speed = Math.min(2, Math.max(0.5, speedVal));
    }

    const volVal = parseFloat(vol);
    if (!isNaN(volVal)) {
        requestBody.vol = Math.min(10, Math.max(0, volVal));
    }

    const pitchVal = parseInt(pitch, 10);
    if (!isNaN(pitchVal)) {
        requestBody.pitch = Math.min(12, Math.max(-12, pitchVal));
    }

    const emotionVal = getSelectValue(emotion);
    if (emotionVal) {
        requestBody.emotion = emotionVal;
    }

    requestBody.inference = getBoolValue(inference);

    debugLog('构建请求体完成', { body: requestBody }, logID);
    return requestBody;
}

export default fieldDecoratorKit;
