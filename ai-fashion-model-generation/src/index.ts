import { FieldType, fieldDecoratorKit, FormItemComponent, FieldExecuteCode, AuthorizationType } from 'dingtalk-docs-cool-app';
const { t } = fieldDecoratorKit;

// 通过addDomainList添加请求接口的域名
fieldDecoratorKit.setDomainList(['base-api.aimaxhug.com', 'jia-test.aimaxhug.com', 'stag-base-api.aimaxhug.com']);

// ==================== 1. 基础配置与工具模块 ====================
import { v4 as uuidv4 } from 'uuid';

const ENV_CONFIG = {
    PROD: 'https://base-api.aimaxhug.com/api/v2/text-to-audio/fashionModelApiKey',
    LOCAL: 'http://jia-test.aimaxhug.com:3300/api/v2/fashionModelApiKey'
} as const;
const USE_ENV = 'LOCAL' as keyof typeof ENV_CONFIG;
const SERVICE_URL = ENV_CONFIG[USE_ENV];

fieldDecoratorKit.setDecorator({
    name: '生成模特https://www.aimaxhug.com',
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
        //性别
        {
            key: 'checkout_gender',
            label: '性别',
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: 'male',
                options: [
                    { key: 'male', title: '男' },
                    { key: 'female', title: '女' },
                ],
                placeholder: t('genderPlaceholder')
            },
            validator: { required: false }
        },
        // 年龄
        {
            key: 'checkout_age',
            label: '年龄',
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: 'youth',
                options: [
                    { key: 'elderly', title: '老年 (60岁以上)' },
                    { key: 'middle_aged', title: '中年 (35-60岁)' },
                    { key: 'youth', title: '青年 (18-35岁)' },
                    { key: 'teenager', title: '青少年 (12-18岁)' },
                    { key: 'child', title: '大童 (6-12岁)' },
                    { key: 'baby', title: '小童 (1-3岁)' },
                    { key: 'infant', title: '婴儿 (1岁以内)' },
                ],
                placeholder: t('agePlaceholder')
            },
            validator: { required: false }
        },
        // 模特风格
        {
            key: 'checkout_model_style',
            label: '风格',
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: '冷感高级',
                options: [
                    { key: '无', title: '无' },
                    { key: '冷感高级', title: '冷感高级' },
                    { key: '清新日系', title: '清新日系' },
                    { key: '街头酷飒', title: '街头酷飒' },
                    { key: '法式慵懒', title: '法式慵懒' },
                    { key: '复古胶片', title: '复古胶片' },
                    { key: '未来科技', title: '未来科技' },
                    { key: '极简北欧', title: '极简北欧' },
                    { key: '国风新中式', title: '国风新中式' },
                    { key: '洛丽塔甜', title: '洛丽塔甜' },
                    { key: '运动活力', title: '运动活力' },
                    { key: '商务精英', title: '商务精英' },
                    { key: '暗黑朋克', title: '暗黑朋克' },
                ],
                placeholder: t('stylePlaceholder')
            },
            validator: { required: false }
        },
        // 身体特征
        {
            key: 'checkout_body_feature',
            label: '身体特征',
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: 'standard',
                options: [
                    { key: 'standard', title: '标准' },
                    { key: 'slim', title: 'slim' },
                    { key: 'fat', title: 'fat' },
                    { key: 'full', title: 'full' },
                    { key: 'large', title: 'large' },
                    { key: 'fit', title: 'fit' },
                ],
                placeholder: t('bodyFeaturePlaceholder')
            },
            validator: { required: false }
        },
        // 地域特征
        {
            key: 'checkout_ethnicity',
            label: '地域特征',
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: 'asian',
                options: [
                    { key: 'asian', title: '亚洲' },
                    { key: 'european', title: '欧美' },
                    { key: 'african', title: '非洲' },
                ],
                placeholder: t('ethnicityPlaceholder')
            },
            validator: { required: false }
        },
        // 出境部位
        {
            key: 'checkout_outlet_part',
            label: '出境部位',
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: 'full_body',

                options: [
                    { key: 'full_body', title: '全身' },
                    { key: 'upper_body', title: '上半身' },
                    // { key: 'lower_body', title: '下半身'},
                ]
                ,
                placeholder: t('outletPartPlaceholder')
            },
            validator: { required: false }
        },
        // 视角
        {
            key: 'checkout_view_angle',
            label: '视角',
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: 'front',
                options: [
                    { key: 'front', title: '正面' },
                    { key: 'side_left', title: '左侧' },
                    { key: 'side_right', title: '右侧' },
                    { key: 'back', title: '背面' },
                ],
                placeholder: t('viewAnglePlaceholder')
            },
            validator: { required: false }
        },
        // 姿势
        {
            key: 'checkout_pose',
            label: '姿势',
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: 'standard',
                options: [
                    { key: 'standard', title: '站姿' },
                    { key: 'walking', title: '走路' },
                    { key: 'cross', title: '叉腰' },
                    { key: 'bottom', title: '插兜' },
                    { key: 'none', title: '无' },
                ],
                placeholder: t('posePlaceholder')
            },
            validator: { required: false }
        },
        //背景
        {
            key: 'checkout_background',
            label: '背景',
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: 'white',
                options: [
                    { key: 'white', title: '纯白' },
                    { key: 'gray', title: '灰色' },
                    { key: 'street', title: '街拍' },
                    { key: 'natural', title: '自然场景' },
                ],
                placeholder: t('backgroundPlaceholder')
            },
            validator: { required: false }
        },
        //比例
        {
            key: 'checkout_aspect_ratio',
            label: '比例',
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: '1:1',
                options: [
                    { key: '1:1', title: '1:1' },
                    { key: '3:4', title: '3:4' },
                    { key: '9:16', title: '9:16' },
                    { key: '16:9', title: '16:9' },
                    { key: '4:3', title: '4:3' },
                ],
                placeholder: t('aspectRatioPlaceholder')
            },
            validator: { required: false }
        },
        // 参考图
        {
            key: 'checkout_reference_image',
            label: '参考图',
            component: FormItemComponent.FieldSelect,
            // 默认只传入一张图片
            props: {
                supportTypes: [FieldType.Attachment, FieldType.Text]
            },
            validator: { required: false },
            tooltips: { title: '支持文本或txt格式的文本附件。未上传参考音频时，最多支持10000字符内容；上传参考音频后最多支持3000字符' }
        },
        //自定义指令
        {
            // 文本内容输入字段
            key: 'checkout_custom_instruction',
            label: '自定义指令',
            component: FormItemComponent.Textarea,
            props: {
                placeholder: '例如:飘逸的金色长卷发，高鼻梁，脸上化着淡妆，洋溢着自信的微笑',
                enableFieldReference: true
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





            // ==================== 第二步：构建请求数据 ====================

            // 构建标准化的API请求体（飞书框架会自动添加授权信息）
            const requestBody = buildRequestBody(formData);


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

            // const { audioUrl } = extractResponseData(result);
            // if (!audioUrl) {
            //     return {
            //         code: FieldExecuteCode.Error,
            //         errorMessage: 'NO_AUDIO_URL'
            //     };
            // }
            const { fashionModelUrl, imageName } = extractResponseData(result);
            if (!fashionModelUrl) {
                return {
                    code: FieldExecuteCode.Error,
                    errorMessage: 'NO_FASHION_MODEL_URL'
                };
            }


            // 文件名处理逻辑
            let fileName = imageName;
            if (!fileName) {
                // 从URL中提取文件名，如果没有则使用默认名称
                const urlParts = fashionModelUrl.split('/');
                const lastPart = urlParts[urlParts.length - 1];
                // 如果有文件名，提取；否则使用默认名称
                if (lastPart && lastPart.includes('.')) {
                    fileName = lastPart.split('?')[0]; // 移除查询参数
                } else {
                    fileName = `fashion-model-${Date.now()}.jpg`;
                }
            }
            debugLog('===007 开始检查音频大小 ===', result, logID);

            debugLog('===008 执行完成 ===', result, logID);
            return {
                code: FieldExecuteCode.Success,
                data: [
                    {
                        fileName: fileName,
                        url: fashionModelUrl,
                        size: 8362,
                        type: 'image'
                    }
                ],
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

function extractResponseData(result) {
    // 后端返回格式: { status: 200, data: { fashionModelUrl: "xxxx" }, message: "ok" }
    // data 可能为 null

    let fashionModelUrl = null;
    let imageName = null;
    if (result && typeof result === 'object' && result.data && typeof result.data === 'object') {
        fashionModelUrl = result.data.fashionModelUrl || null;
        imageName = result.data.imageName || null;
    }

    return {
        fashionModelUrl,
        imageName
    };
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

function buildRequestBody(params) {
    // 辅助函数：从飞书表单字段中提取值
    const getFieldValue = (fieldValue) => {
        if (!fieldValue) return null;

        // 如果是对象格式 {label: 'xxx', value: 'xxx'}，提取value
        if (typeof fieldValue === 'object' && fieldValue.value !== undefined) {
            return fieldValue.value;
        }

        // 如果是数组格式 [{label: 'xxx', value: 'xxx'}]，提取第一个元素的value
        if (Array.isArray(fieldValue) && fieldValue.length > 0) {
            const firstItem = fieldValue[0];
            if (typeof firstItem === 'object' && firstItem.value !== undefined) {
                return firstItem.value;
            }
        }

        // 如果已经是字符串，直接返回
        if (typeof fieldValue === 'string') {
            return fieldValue;
        }

        return null;
    };

    const {
        checkout_gender,
        checkout_age,
        checkout_model_style,
        checkout_body_feature,
        checkout_ethnicity,
        checkout_outlet_part,
        checkout_view_angle,
        checkout_pose,
        checkout_background,
        checkout_aspect_ratio,
        checkout_reference_image,
        checkout_custom_instruction,
        checkout_negative_prompt
    } = params;

    const requestBody = {
        // model: getFieldValue(checkout_model),
        gender: getFieldValue(checkout_gender),
        age: getFieldValue(checkout_age),
        style: getFieldValue(checkout_model_style),
        bodyFeature: getFieldValue(checkout_body_feature),
        ethnicity: getFieldValue(checkout_ethnicity),
        outletPart: getFieldValue(checkout_outlet_part),
        viewAngle: getFieldValue(checkout_view_angle),
        pose: getFieldValue(checkout_pose),
        background: getFieldValue(checkout_background),
        aspectRatio: getFieldValue(checkout_aspect_ratio)
    };
    // 处理参考图附件 - 提取URL地址
    if (checkout_reference_image && Array.isArray(checkout_reference_image) && checkout_reference_image.length > 0) {

        // 取第一个附件的tmp_url作为参考图URL
        const firstImage = checkout_reference_image[0];
        if (firstImage && firstImage.tmp_url) {
            (requestBody as any).referenceImage = firstImage.tmp_url;
        }
    }


    if (checkout_custom_instruction) {
        (requestBody as any).customInstruction = checkout_custom_instruction;
    }

    if (checkout_negative_prompt) {
        (requestBody as any).negativePrompt = checkout_negative_prompt;
    }

    debugLog('=== 构建请求体 ===', {
        originalParams: params,
        requestBody: requestBody
    });

    return requestBody;
}


export default fieldDecoratorKit;
