import { FieldType, fieldDecoratorKit, FormItemComponent, FieldExecuteCode, AuthorizationType } from 'dingtalk-docs-cool-app';
const { t } = fieldDecoratorKit;

fieldDecoratorKit.setDomainList(['base-api.aimaxhug.com', 'jia-test.aimaxhug.com', 'stag-base-api.aimaxhug.com']);

import { v4 as uuidv4 } from 'uuid';

// ==================== 环境配置 ====================

const ENV_CONFIG = {
    PROD: 'https://base-api.aimaxhug.com/api/v2/video-tencentcloud/minimax-h3',
    LOCAL: 'http://jia-test.aimaxhug.com:3200/api/v2/video-tencentcloud/minimax-h3'
} as const;

const USE_ENV = 'PROD' as keyof typeof ENV_CONFIG;
const SERVICE_URL = ENV_CONFIG[USE_ENV];

// ==================== 工具函数 ====================

function debugLog(step: string, data?: any, logID?: string) {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    console.log(JSON.stringify({
        timestamp,
        logID: logID || 'N/A',
        step,
        data
    }));
}

function processAttachments(fieldValue: any): any[] {
    if (!fieldValue) return [];

    const list = Array.isArray(fieldValue) ? fieldValue.flat(2) : [fieldValue];

    return list
        .filter(item => item && item.tmp_url)
        .map(item => ({
            tmp_url: item.tmp_url,
            name: item.name || '',
            type: item.type || '',
            size: item.size || 0
        }));
}

function getSelectValue(fieldValue: any) {
    if (!fieldValue) return null;
    if (typeof fieldValue === 'string') return fieldValue;
    if (Array.isArray(fieldValue)) return getSelectValue(fieldValue[0]);
    return fieldValue.value || fieldValue.key || null;
}

function buildRequestBody(params: any, logID?: string) {
    const body: any = {
        prompt: (params.prompt || '').trim(),
        images: processAttachments(params.images),
        duration: getSelectValue(params.duration) || '5',
        aspect_ratio: getSelectValue(params.aspect_ratio) || '16:9',
        resolution: getSelectValue(params.resolution) || '720p',
        model: getSelectValue(params.model) || 'minimax-h3',
    };

    debugLog('构建请求体完成', { body }, logID);
    return body;
}

// ==================== 钉钉插件配置 ====================

fieldDecoratorKit.setDecorator({
    name: 'AI 视频生成(MiniMax H3) https://www.aimaxhug.com',

    i18nMap: {
        'zh-CN': {
            'pluginName': 'AI 视频生成（MiniMax H3）',
            'promptLabel': '提示词',
            'promptPlaceholder': '请描述画面内容，并控制在7000字符内',
            'imageLabel': '参考素材',
            'imageTips': '1.不传=文生视频；2.图片最多9张(<30MB/张)；视频最多3段(每段2~15秒,<50MB/段)；音频最多3个(MP3,<15MB/个)',
            'modelLabel': '生成模型',
            'modelPlaceholder': '默认 minimax-h3 标准版',
            'durationLabel': '视频时长',
            'aspectLabel': '画面比例',
            'resolutionLabel': '分辨率',
            'resolutionTips': '分辨率越高，消耗 token 越多，成本越高。原型调试建议用 768p',
            'err_format': '后端服务器返回了无效的响应格式',
            'err_no_url': '未获取到生成的视频地址',
            'err_400': '请求参数错误，请检查输入内容',
            'err_401': '认证失败，请检查 API Key',
            'err_403': '无权限访问',
            'err_429': '请求过于频繁，请稍后重试',
            'err_500': '服务器内部错误',
            'err_unknown': '服务器返回未知异常',
            'err_service': '服务执行异常，请稍后重试'
        },
        'en-US': {
            'pluginName': 'AI Video Generation (MiniMax H3)',
            'promptLabel': 'Prompt',
            'promptPlaceholder': 'Describe the visual content, within 7000 characters',
            'imageLabel': 'Reference Material',
            'imageTips': '1. Empty = text-to-video; 2. Max 9 images (<30MB each), max 3 videos (2-15s each, <50MB each), max 3 audio files (MP3, <15MB each)',
            'modelLabel': 'Model',
            'modelPlaceholder': 'Default: minimax-h3 Standard',
            'durationLabel': 'Duration',
            'aspectLabel': 'Aspect Ratio',
            'resolutionLabel': 'Resolution',
            'resolutionTips': 'Higher resolution consumes more tokens and costs more. Use 768p for prototyping.',
            'err_format': 'Invalid response format from server',
            'err_no_url': 'Failed to get the generated video URL',
            'err_400': 'Request parameter error',
            'err_401': 'Authentication failed',
            'err_403': 'Access denied',
            'err_429': 'Too many requests, please try again later',
            'err_500': 'Internal server error',
            'err_unknown': 'Unknown server error',
            'err_service': 'Service execution exception'
        },
        'ja-JP': {
            'pluginName': 'AI動画生成（MiniMax H3）',
            'promptLabel': 'プロンプト',
            'promptPlaceholder': '映像内容を説明してください（7000文字以内）',
            'imageLabel': '参照素材',
            'imageTips': '1. 空=テキスト→動画；2. 画像最大9枚（各30MB未満）、動画最大3本（各2～15秒、50MB未満）、音声最大3ファイル（MP3、各15MB未満）',
            'modelLabel': '生成モデル',
            'modelPlaceholder': 'デフォルト: minimax-h3 標準版',
            'durationLabel': '動画時間',
            'aspectLabel': '画面比率',
            'resolutionLabel': '解像度',
            'resolutionTips': '解像度が高いほどトークン消費とコストが増加します。プロトタイプ調整には768pを推奨。',
            'err_format': 'サーバーからの応答形式が無効です',
            'err_no_url': '生成された動画URLを取得できませんでした',
            'err_400': 'リクエストパラメータのエラーです',
            'err_401': '認証に失敗しました',
            'err_403': 'アクセス権限がありません',
            'err_429': 'リクエストが多すぎます。しばらくしてから再試行してください',
            'err_500': 'サーバー内部エラーが発生しました',
            'err_unknown': '不明なサーバーエラー',
            'err_service': 'サービスの実行中に例外が発生しました'
        }
    },

    errorMessages: {
        'INVALID_FORMAT': t('err_format'),
        'NO_MEDIA_URL': t('err_no_url'),
        'ERROR_400': t('err_400'),
        'ERROR_401': t('err_401'),
        'ERROR_403': t('err_403'),
        'ERROR_429': t('err_429'),
        'ERROR_500': t('err_500'),
        'ERROR_UNKNOWN': t('err_unknown'),
        'ERROR_SERVICE': t('err_service'),
    },

    formItems: [
        {
            key: 'prompt',
            label: t('promptLabel'),
            component: FormItemComponent.Textarea,
            props: {
                placeholder: t('promptPlaceholder'),
                enableFieldReference: true
            },
            validator: { required: true }
        },
        {
            key: 'images',
            label: t('imageLabel'),
            component: FormItemComponent.FieldSelect,
            props: {
                mode: 'multiple',
                supportTypes: [FieldType.Attachment]
            },
            validator: { required: false },
            tooltips: { title: t('imageTips') }
        },
        {
            key: 'model',
            label: t('modelLabel'),
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: 'minimax-h3',
                options: [
                    { key: 'minimax-h3', title: 'minimax-h3' },
                    { key: 'minimax-h3-pro', title: 'minimax-h3-pro' },
                ],
                placeholder: t('modelPlaceholder')
            },
            validator: { required: false }
        },
        {
            key: 'duration',
            label: t('durationLabel'),
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: '5',
                options: [
                    { key: '5', title: '5秒' },
                    { key: '10', title: '10秒' },
                    { key: '15', title: '15秒' },
                ],
                placeholder: '默认5秒'
            },
            validator: { required: false }
        },
        {
            key: 'aspect_ratio',
            label: t('aspectLabel'),
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: '16:9',
                options: [
                    { key: '16:9', title: '16:9' },
                    { key: '9:16', title: '9:16' },
                    { key: '1:1', title: '1:1' },
                    { key: '4:3', title: '4:3' },
                    { key: '3:4', title: '3:4' }
                ],
                placeholder: '默认16:9'
            },
            validator: { required: false }
        },
        {
            key: 'resolution',
            label: t('resolutionLabel'),
            component: FormItemComponent.SingleSelect,
            props: {
                options: [
                    { key: '768p', title: '768p' },
                    { key: '2k', title: '2k' }
                ],
                placeholder: '默认720p'
            },
            validator: { required: false },
            tooltips: { title: t('resolutionTips') }
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
        const logID = context.extensionId || `minimax_h3_${uuidv4()}`;
        debugLog('=== 钉钉执行开始 ===', { formData, baseId: context.baseId, sheetId: context.sheetId }, logID);

        try {
            const requestBody = buildRequestBody(formData, logID);

            const response = await context.fetch(
                SERVICE_URL,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                },
                'aimaxhug_auth'
            );

            if (!response.ok) {
                let errorData: any;
                try { errorData = await response.json(); } catch { errorData = {}; }

                const status = response.status;
                const msg = errorData?.message || response.statusText || '未知错误';
                debugLog('HTTP请求失败', { status, msg }, logID);

                const codeMap = {
                    400: FieldExecuteCode.InvalidArgument,
                    401: FieldExecuteCode.AuthorizationError,
                    403: FieldExecuteCode.QuotaExhausted,
                    429: FieldExecuteCode.RateLimit
                };
                const errKey = `ERROR_${status}`;
                return {
                    code: codeMap[status] || FieldExecuteCode.Error,
                    errorMessage: [400, 401, 403, 429, 500].includes(status) ? errKey : 'ERROR_UNKNOWN',
                    msg: `[服务异常 ${status}]: ${msg}`
                };
            }

            const result = await response.json();
            debugLog('=== 接收响应结果 ===', result, logID);

            if (!result || typeof result !== 'object') {
                return {
                    code: FieldExecuteCode.Error,
                    errorMessage: 'INVALID_FORMAT'
                };
            }

            const statusVal = result.code || result.status;
            if (typeof statusVal !== 'number') {
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
                    case 429: errKey = 'ERROR_429'; break;
                    case 500: errKey = 'ERROR_500'; break;
                }
                return {
                    code: FieldExecuteCode.Error,
                    errorMessage: errKey,
                    msg: `生成失败：${result.message || '后端处理异常'}`
                };
            }

            const mediaUrl = result.data?.url || result.data?.videoUrl;
            if (typeof mediaUrl !== 'string' || !mediaUrl) {
                return {
                    code: FieldExecuteCode.Error,
                    errorMessage: 'NO_MEDIA_URL'
                };
            }

            const ext = mediaUrl.split('.').pop()?.split('?')[0] || 'mp4';
            const fileName = `AI_Gen_${Date.now()}.${ext}`;

            debugLog('=== 执行完成 ===', { fileName, url: mediaUrl }, logID);
            return {
                code: FieldExecuteCode.Success,
                data: [{ fileName, url: mediaUrl, size: 0, type: "video" }],
            };

        } catch (error: any) {
            debugLog('=== 执行异常 ===', { error: error?.message || String(error) }, logID);
            return {
                code: FieldExecuteCode.Error,
                extra: { logID },
                errorMessage: 'ERROR_SERVICE'
            };
        }
    },
});

export default fieldDecoratorKit;
