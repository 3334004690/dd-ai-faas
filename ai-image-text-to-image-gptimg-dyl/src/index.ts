import { FieldType, fieldDecoratorKit, FormItemComponent, FieldExecuteCode, AuthorizationType } from 'dingtalk-docs-cool-app';
import { v4 as uuidv4 } from 'uuid';

const { t } = fieldDecoratorKit;

// ==================== 1. 环境配置与域名白名单 ====================

// 域名白名单配置
fieldDecoratorKit.setDomainList([
    'base-api.aimaxhug.com',
    'jia-test.aimaxhug.com'
]);

// 环境与 URL 配置
const ENV_CONFIG = {
    PROD: 'https://base-api.aimaxhug.com/api/v1/gpt-image-2/imageToImage',
    LOCAL: 'http://jia-test.aimaxhug.com:3200/api/v1/gpt-image-2/imageToImage'
} as const;

/**
 * 【环境切换开关】：修改此处即可切换请求环境
 * 可选值: 'PROD' | 'TEST' | 'STAG'
 */
const ACTIVE_ENV: keyof typeof ENV_CONFIG = 'PROD'; 
const SERVICE_URL = ENV_CONFIG[ACTIVE_ENV];

fieldDecoratorKit.setDecorator({
    name: 'AI 图文生图（GPT-Image-2）',

    // ==================== 2. 国际化 (参考钉钉版本同步) ====================
    i18nMap: {
        'zh-CN': {
            'pluginName': 'AI 图文生图（GPT-Image-2）',
            'label_prompt': '提示词',
            'p_prompt': '请输入提示词，描述你想要的画面',
            'label_img': '原始图片',
            'p_img': '请上传参考图片',
            'label_res': '生成比例',
            'res_auto': '默认',
            'err_no_img': '未获取到生成的图片地址',
            'err_fetch': '服务执行异常，请稍后重试',
            'err_401': '认证失败，请检查 API Key',
            'err_403': '无权限访问',
            'err_500': '服务器内部错误'
        },
        'en-US': {
            'pluginName': 'AI Image Generation (AimaxHug)',
            'label_prompt': 'Prompt',
            'p_prompt': 'Enter your prompt here',
            'label_img': 'Source Image',
            'p_img': 'Upload a reference image',
            'label_res': 'Resolution',
            'res_auto': 'Auto',
            'err_no_img': 'Failed to get image URL',
            'err_fetch': 'Service execution error'
        }
    },

    errorMessages: {
        'NO_IMAGE_URL': t('err_no_img'),
        'ERROR_SERVICE': t('err_fetch'),
        'ERROR_401': t('err_401'),
        'ERROR_403': t('err_403'),
        'ERROR_500': t('err_500'),
    },

    // ==================== 3. UI 界面配置 (参考钉钉全量分辨率) ====================
    formItems: [
        {
            key: 'prompt',
            label: t('label_prompt'),
            component: FormItemComponent.Textarea,
            props: {
                placeholder: t('p_prompt'),
                enableFieldReference: true
            },
            validator: { required: true }
        },
        {
            key: 'original_image',
            label: t('label_img'),
            component: FormItemComponent.FieldSelect,
            props: {
                mode: 'multiple',
                supportTypes: [FieldType.Attachment]
            },
             validator: { required: true },
            tooltips: { title: t('p_img') }
        },
        {
            key: 'resolution',
            label: t('label_res'),
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: 'auto',
                placeholder: t('label_res'),
                // 全量抄写钉钉 15 种比例配置
                options: [
                    { key: 'auto', title: t('res_auto') },
                    { key: '3840x3840', title: '1:1' },
                    { key: '3840x2880', title: '4:3' },
                    { key: '2880x3840', title: '3:4' },
                    { key: '3840x2560', title: '3:2' },
                    { key: '2560x3840', title: '2:3' },
                    { key: '3840x2160', title: '16:9' },
                    { key: '2160x3840', title: '9:16' },
                    { key: '3072x3840', title: '4:5' },
                    { key: '3840x3072', title: '5:4' },
                    { key: '3840x1644', title: '21:9' },
                    { key: '3840x960', title: '4:1' },
                    { key: '960x3840', title: '1:4' },
                    { key: '3840x480', title: '8:1' },
                    { key: '480x3840', title: '1:8' }
                ],
            }
            , validator: { required: true }
        },
    ],

    resultType: {
        type: FieldType.Attachment,
    },

    // ==================== 4. 鉴权配置 (原封不动，符合钉钉解析) ====================
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

    // ==================== 5. 执行逻辑 (结合钉钉 Body 解析) ====================
    execute: async (context, formData) => {
        const logID = context.extensionId || `DT_${uuidv4().substring(0, 8)}`;
        debugLog('===001 执行开始 ===', { ACTIVE_ENV, formData }, logID);

        try {
            // 使用同步钉钉逻辑的 Body 构造器
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

            const result = await response.json();
            debugLog('===002 接收响应 ===', result, logID);

            const statusVal = result.status ?? result.code;

            if (statusVal !== 200) {
                const errKeyMap: any = { 400: 'ERROR_400', 401: 'ERROR_401', 403: 'ERROR_403', 500: 'ERROR_500' };
                return {
                    code: FieldExecuteCode.Error,
                    errorMessage: errKeyMap[statusVal] || 'ERROR_SERVICE'
                };
            }

            const imageUrl = result.data?.imageUrl;
            if (!imageUrl) {
                return { code: FieldExecuteCode.Error, errorMessage: 'NO_IMAGE_URL' };
            }

            // 文件名处理
            const fileName = imageUrl.split('/').pop()?.split('?')[0] || `ai_${Date.now()}.png`;

            return {
                code: FieldExecuteCode.Success,
                data: [{ 
                    fileName: fileName, 
                    url: imageUrl, 
                    type: "image",
                    size: result.data?.size || 1024 * 512
                }],
            };

        } catch (error: any) {
            debugLog('=== 执行异常 ===', { error: error.message }, logID);
            return {
                code: FieldExecuteCode.Error,
                errorMessage: 'ERROR_SERVICE',
                extra: { logID }
            };
        }
    },
});

/**
 * 核心工具：深度 Body 构造器 (同步钉钉解析逻辑)
 */
function buildRequestBody(params: any, logID?: string) {
    const { prompt, original_image, resolution } = params;

    // 辅助获取单选值
    const getVal = (v: any) => (v && typeof v === 'object' ? (v.key || v.value || (Array.isArray(v) ? v[0]?.key : null)) : v);

    // 钉钉版附件解析逻辑：支持嵌套数组和提取 tmp_url
    const processedAttachments: any[] = [];
    if (original_image) {
        const pushAttachment = (item: any) => {
            if (item && item.tmp_url) {
                processedAttachments.push({
                    tmp_url: item.tmp_url,
                    name: item.name || '',
                    type: item.type === 'image' ? 'image/jpeg' : (item.type || ''),
                    size: item.size || 0
                });
            }
        };

        if (Array.isArray(original_image)) {
            original_image.forEach((item: any) => {
                if (Array.isArray(item)) {
                    item.forEach(subItem => pushAttachment(subItem));
                } else {
                    pushAttachment(item);
                }
            });
        } else {
            pushAttachment(original_image);
        }
    }

    const body = {
        prompt: (prompt || '').trim(),
        resolution: getVal(resolution) || 'auto',
        model: 'gpt-image-2', // 固定模型名
        original_image: processedAttachments
    };

    debugLog('=== Body 构造完成 ===', body, logID);
    return body;
}

function debugLog(step: string, data: any, logID: string) {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), logID, step, data }));
}

export default fieldDecoratorKit;