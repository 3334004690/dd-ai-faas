import { FieldType, fieldDecoratorKit, FormItemComponent, FieldExecuteCode, AuthorizationType } from 'dingtalk-docs-cool-app';
const { t } = fieldDecoratorKit;

// 通过addDomainList添加请求接口的域名
fieldDecoratorKit.setDomainList(['base-api.aimaxhug.com', 'jia-test.aimaxhug.com', 'stag-base-api.aimaxhug.com']);

// ==================== 1. 基础配置与工具模块 ====================
import { v4 as uuidv4 } from 'uuid';

const ENV_CONFIG = {
    PROD: 'https://base-api.aimaxhug.com/api/v1/imageToImage',
    LOCAL: 'http://jia-test.aimaxhug.com:3200/api/v1/imageToImage'
} as const;
const USE_ENV = 'PROD' as keyof typeof ENV_CONFIG;
const SERVICE_URL = ENV_CONFIG[USE_ENV];

fieldDecoratorKit.setDecorator({
    name: 'AI 生图多模型(Gpt-image-2) https://www.aimaxhug.com ',
    // 定义捷径的i18n语言资源 [cite: 2]
    i18nMap: {
        'zh-CN': {
            'pluginName': 'AI 生图多模型（Gpt-image-2）',
            'modelLabel': 'AI 模型',
            'modelPlaceholder': '支持 gemini、gpt-image、seedream 等系列，请从官网 https://www.aimaxhug.com 的模型广场直接复制完整模型名称，若不指定则系统自动使用默认模型生成图片',
            'imageLabel': '原始图片',
            'imageTips': '请注意：1.gemini pro最多支持14张参考图，每张大小不超过7MB；最多6张可保持对象高保真，最多5张可保持角色高保真；2.gemini 2最多支持14张参考图，最多10张可保持对象高保真，最多4张可保持角色高保真；',
            'promptLabel': '提示词',
            'promptPlaceholder': '请输入你希望AI完成的任务',
            'resLabel': '分辨率',
            'resPlaceholder': '请注意：1.选择的分辨率只对gemini模型生效；2.gpt模型分为普通及4k模型，普通模型默认出图1k，特定尺寸比例支持对应分辨率，如：1:1支持2k，9:16和16:9支持4k；4k模型支持2k及以上分辨率',
            'propLabel': '比例',
            'mr': '默认',
            'propPlaceholder': '请注意：1.gpt模型分为普通及4k模型，普通模型默认出图1k，特定尺寸比例支持对应分辨率，如：1:1支持2k，9:16和16:9支持4k；4k模型支持2k及以上分辨率',
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
            'modelPlaceholder': '1. Manual entry prohibited: Do not type the model name yourself. You must copy the complete and accurate model name directly from the official Model Plaza. 2. Default model rule: If no model series or name is specified, the system will automatically use the default model for image generation. 3. Supported model series: gemini series, gpt-image series, seedream series, etc. 4. Official website: https://www.aimaxhug.com/',
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
            'modelPlaceholder': '1. 手入力禁止：モデル名を自分で入力しないでください。公式サイトのモデル広場から完全かつ正確なモデル名を直接コピーする必要があります。2. デフォルトモデルルール：モデルシリーズと名前を指定しない場合、システムはデフォルトモデルを自動的に使用して画像を生成します。3. サポート対象モデルシリーズ：geminiシリーズ、gpt-imageシリーズ、seedreamシリーズなど。4. 公式サイト：https://www.aimaxhug.com/',
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
            key: 'original_image',
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
                defaultValue: '',
                options: [
                     { key: '', title: t('mr') },
                    { key: '1:1', title: '1:1' },
                    { key: '9:16', title: '9:16' },
                    { key: '16:9', title: '16:9' },
                    { key: '2:3', title: '2:3' },
                    { key: '3:2', title: '3:2' },
                    { key: '3:4', title: '3:4' },
                    { key: '4:3', title: '4:3' },
                    { key: '4:5', title: '4:5' },
                    { key: '5:4', title: '5:4' },
                    { key: '21:9', title: '21:9' }
                ],
                placeholder: t('propPlaceholder')
            },
            validator: { required: false },
            tooltips: { title: t('propPlaceholder') }
        },
        {
            key: 'model',
            label: t('modelLabel'),
            component: FormItemComponent.Textarea,
            props: {
                placeholder: t('modelPlaceholder'),
                enableFieldReference: true
     
            },
            validator: { required: false }
            // tooltips: { title: t('modelPlaceholder') }
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
    const mdl = getSelectValue(model) || 'gpt-image-2-4K';
    if (mdl) requestBody.model = mdl;

    return requestBody;
}

export default fieldDecoratorKit;