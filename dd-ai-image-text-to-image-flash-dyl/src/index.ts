import { FieldType, fieldDecoratorKit, FormItemComponent, FieldExecuteCode, AuthorizationType } from 'dingtalk-docs-cool-app';
const { t } = fieldDecoratorKit;

// 通过addDomainList添加请求接口的域名
fieldDecoratorKit.setDomainList(['base-api.aimaxhug.com', 'yi-test.aimaxhug.com', 'stag-base-api.aimaxhug.com']);

// ==================== 1. 基础配置与工具模块 ====================
import { v4 as uuidv4 } from 'uuid';

const AI_SERVICE_URL1 = 'https://base-api.aimaxhug.com/api/v1/imageToImage'; // 生产环境

fieldDecoratorKit.setDecorator({
    name: 'AI 生文多模型（AimaxHug）',
    // 定义捷径的i18n语言资源 [cite: 2]
    i18nMap: {
        'zh-CN': {
            'pluginName': 'AI 生文多模型（AimaxHug）',
            'modelLabel': 'AI 模型',
            'modelPlaceholder': '请选择生成图片的 AI 模型',
            'imageLabel': '原始图片',
            'imageTips': '请上传原始图片',
            'promptLabel': '提示词',
            'promptPlaceholder': '请输入您的提示词...',
            'resLabel': '分辨率',
            'resPlaceholder': '选择生成图片的分辨率',
            'propLabel': '比例',
            'propPlaceholder': '选择生成图片的比例',
            'apiKeyPlaceholder': '请输入您的 API Key (例如: Bearer xxx)',
            // 错误提示 [cite: 12]
            'err_format': '后端服务器返回了无效的响应格式',
            'err_no_url': '未获取到生成的图片地址',
            'err_400': '请求参数错误，请检查输入内容',
            'err_401': '认证失败，请检查 API Key',
            'err_403': '无权限访问',
            'err_500': '服务器内部错误',
            'err_unknown': '服务器返回未知异常',
            'err_service': '服务执行异常，请稍后重试'
        },
        'en-US': {
            'pluginName': 'AI Image Generation Multi-Model (AimaxHug)',
            'modelLabel': 'AI Model',
            'modelPlaceholder': 'Select an AI model',
            'imageLabel': 'Original Image',
            'imageTips': 'Please upload the original image',
            'promptLabel': 'Prompt',
            'promptPlaceholder': 'Enter your prompt...',
            'resLabel': 'Resolution',
            'resPlaceholder': 'Select image resolution',
            'propLabel': 'Proportion',
            'propPlaceholder': 'Select image proportion',
            'apiKeyPlaceholder': 'Enter API Key (e.g., Bearer xxx)',
            'err_format': 'Invalid response format from server',
            'err_no_url': 'Failed to get the generated image URL',
            'err_400': 'Request parameter error',
            'err_401': 'Authentication failed',
            'err_403': 'Access denied',
            'err_500': 'Internal server error',
            'err_unknown': 'Unknown server error',
            'err_service': 'Service execution exception'
        },
        'ja-JP': {
            'pluginName': 'AI画像生成マルチモデル（AimaxHug）',
            'modelLabel': 'AI モデル',
            'modelPlaceholder': 'AI モデルを選択してください',
            'imageLabel': '元の画像',
            'imageTips': '元の画像をアップロードしてください',
            'promptLabel': 'プロンプト',
            'promptPlaceholder': 'プロンプトを入力してください...',
            'resLabel': '解像度',
            'resPlaceholder': '解像度を選択してください',
            'propLabel': '比率',
            'propPlaceholder': '比率を選択してください',
            'apiKeyPlaceholder': 'APIキーを入力してください',
            'err_format': 'サーバーからの応答形式が無効です',
            'err_no_url': '生成された画像URLを取得できませんでした',
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
        'NO_IMAGE_URL': t('err_no_url'),
        'ERROR_400': t('err_400'),
        'ERROR_401': t('err_401'),
        'ERROR_403': t('err_403'),
        'ERROR_500': t('err_500'),
        'ERROR_UNKNOWN': t('err_unknown'),
        'ERROR_SERVICE': t('err_service'),
    },

    formItems: [
        {
            key: 'model',
            label: t('modelLabel'),
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: 'nano_banana',
                options: [
                    { key: 'nano_banana', title: 'Nano Banana Pro' },
                    { key: 'nano_banana_2', title: 'Nano Banana 2' },
                    { key: 'seed_dream', title: 'Seed Dream' },
                    { key: 'qwen_image', title: 'Qwen Image' }
                ],
                placeholder: t('modelPlaceholder'),
            },
            validator: { required: true },
            tooltips: { title: t('modelPlaceholder') }
        },
        {
            key: 'original_image',
            label: t('imageLabel'),
            component: FormItemComponent.FieldSelect,
            props: {
                mode: 'multiple',
                supportTypes: [FieldType.Attachment]
            },
            validator: { required: true },
            tooltips: { title: t('imageTips') }
        },
        {
            key: 'prompt',
            label: t('promptLabel'),
            component: FormItemComponent.Textarea,
            props: {
                placeholder: t('promptPlaceholder'),
                enableFieldReference: true
            },
            validator: { required: true },
            tooltips: { title: t('promptLabel') }
        },
        {
            key: 'resolution',
            label: t('resLabel'),
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: '1k',
                options: [
                    { key: '1k', title: '1k' },
                    { key: '2k', title: '2k' },
                    { key: '4k', title: '4k' }
                ],
                placeholder: t('resPlaceholder')
            },
            validator: { required: false },
            tooltips: { title: t('resPlaceholder') }
        },
        {
            key: 'proportion',
            label: t('propLabel'),
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: '1:1',
                options: [
                    { key: '1:1', title: '1:1' },
                    { key: '3:4', title: '3:4' },
                    { key: '9:16', title: '9:16' },
                    { key: '16:9', title: '16:9' },
                    { key: '4:3', title: '4:3' }
                ],
                placeholder: t('propPlaceholder')
            },
            validator: { required: false },
            tooltips: { title: t('propPlaceholder') }
        }
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
                AI_SERVICE_URL1,
                {
                    method: 'POST',
                    headers:{'Content-Type': 'application/json'},
                    body: JSON.stringify(requestBody)
                }, 'aimaxhug_auth');

            const result = await response.json();
            debugLog('===006 接收响应结果 ===', result, logID);

            const statusVal = (typeof result.status === 'number') ? result.status
                : (typeof result.code === 'number' ? result.code : undefined);

            if (!result || typeof result !== 'object' || typeof statusVal !== 'number') {
                return {
                    code: FieldExecuteCode.Error,
                    errorMessage: 'INVALID_FORMAT' // [cite: 12]
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

            const { imageUrl } = extractResponseData(result);
            if (!imageUrl) {
                return {
                    code: FieldExecuteCode.Error,
                    errorMessage: 'NO_IMAGE_URL'
                };
            }

            // 文件名处理逻辑
            const urlParts = imageUrl.split('/');
            const lastPart = urlParts[urlParts.length - 1];
            let fileName = (lastPart && lastPart.includes('.')) ? lastPart.split('?')[0] : `image-${Date.now()}.png`;
            debugLog('===007 开始检查图片大小 ===', result, logID);
            

            debugLog('===008 执行完成 ===', result, logID);
            return {
                code: FieldExecuteCode.Success,
                data: [{ fileName: fileName, url: imageUrl, size: 8362, type: "image" }],
            };

        } catch (error: any) {
            debugLog('=== 执行异常 ===', { error: error.message }, logID);
            return {
                code: FieldExecuteCode.Error,
                extra: {
                    logID:logID
                },
                errorMessage: 'ERROR_SERVICE'
            };
        }
    },
});

/************ 工具方法 (逻辑保持不变)   *********************** */

const createUniqueId = (() => {
    return (prefix = 'dingding') => `${prefix}_${uuidv4()}`;
})();

function extractResponseData(result: any) {
    let imageUrl = null;
    if (result?.data && typeof result.data === 'object') {
        imageUrl = result.data.imageUrl || null;
    }
    return { imageUrl };
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
    const { model, original_image, prompt, resolution, proportion } = params;

    const getSelectValue = (fieldValue: any) => {
        if (!fieldValue) return null;
        if (typeof fieldValue === 'string') return fieldValue;
        return fieldValue.value || (Array.isArray(fieldValue) && fieldValue[0]?.value) || null;
    };

    const processedAttachments: any[] = [];
    if (original_image) {
        const items = Array.isArray(original_image) ? (Array.isArray(original_image[0]) ? original_image.flat() : original_image) : [original_image];
        items.forEach((item: any) => {
            if (item?.tmp_url) {
                processedAttachments.push({
                    tmp_url: item.tmp_url,
                    name: item.name || '',
                    type: item.type === 'image' ? 'image/jpeg' : (item.type || ''),
                    size: item.size || 0
                });
            }
        });
    }

    const requestBody: any = {
        prompt: (typeof prompt === 'string' ? prompt.trim() : '')
    };

    if (processedAttachments.length > 0) requestBody.original_image = processedAttachments;
    const res = getSelectValue(resolution);
    if (res) requestBody.resolution = res;
    const prop = getSelectValue(proportion);
    if (prop) requestBody.proportion = prop;
    const mdl = getSelectValue(model);
    if (mdl) requestBody.model = mdl;

    return requestBody;
}

export default fieldDecoratorKit;