import { FieldType, fieldDecoratorKit, FormItemComponent, FieldExecuteCode, AuthorizationType } from 'dingtalk-docs-cool-app';
const { t } = fieldDecoratorKit;

// 通过addDomainList添加请求接口的域名
fieldDecoratorKit.setDomainList(['base-api.aimaxhug.com', 'yi-test.aimaxhug.com', 'stag-base-api.aimaxhug.com']);

// ==================== 1. 基础配置与工具模块 ====================
import { v4 as uuidv4 } from 'uuid';

const AI_SERVICE_URL1 = 'https://base-api.aimaxhug.com/api/v1/chat'; // 生产环境

fieldDecoratorKit.setDecorator({
    name: 'AI 智能对话助手',
    // 定义捷径的i18n语言资源
    i18nMap: {
        'zh-CN': {
            'pluginName': 'AI 智能对话助手',
            'prompt': '提示词',
            'promptPlaceholder': '请输入您的指令或问题...',
            'attachment': '参考图',
            'attachmentTips': '注意：仅多模态模型支持图片解析',
            'systemPrompt': '系统提示词（可选）',
            'systemPromptPlaceholder': '用于设定 AI 的角色定位或行为规范',
            'systemPromptTips': '例如：你是一个资深的 Java 架构师，请用简洁的语言回答...',
            'modelName': '指定模型（可选）',
            'modelPlaceholder': '请输入模型 ID（默认自动匹配最佳模型）',
            'modelTips': '字符长度建议在 100 以内',
            'apiKeyPlaceholder': '请输入您的 API Key (例如: Bearer xxx)',
            // 错误提示国际化 
            'err_format': '后端服务器返回了无效的响应格式',
            'err_400': '请求参数错误，请检查输入内容',
            'err_401': '认证失败，请检查 API Key 是否正确',
            'err_403': '无权限访问，请检查账号权限',
            'err_500': '服务器内部错误，请联系技术支持',
            'err_unknown': '服务器返回未知异常',
            'err_service': '服务执行异常，请稍后重试'
        },
        'en-US': {
            'pluginName': 'AI Intelligent Assistant',
            'prompt': 'Prompt',
            'promptPlaceholder': 'Please enter your instructions or questions...',
            'attachment': 'Reference Image',
            'attachmentTips': 'Note: Only multimodal models support image analysis',
            'systemPrompt': 'System Prompt (Optional)',
            'systemPromptPlaceholder': 'Used to define the AI role or behavior guidelines',
            'systemPromptTips': 'e.g., You are a senior software engineer, please reply concisely...',
            'modelName': 'Model Name (Optional)',
            'modelPlaceholder': 'Enter Model ID (defaults to auto-match)',
            'modelTips': 'Recommended limit: 100 characters',
            'apiKeyPlaceholder': 'Please enter API Key (e.g., Bearer xxx)',
            // Error i18n
            'err_format': 'Invalid response format from server',
            'err_400': 'Request parameter error',
            'err_401': 'Authentication failed, please check your API Key',
            'err_403': 'Access denied, please check permissions',
            'err_500': 'Internal server error',
            'err_unknown': 'Unknown server error',
            'err_service': 'Service execution exception'
        },
        'ja-JP': {
            'pluginName': 'AI インテリジェント アシスタント',
            'prompt': 'プロンプト',
            'promptPlaceholder': '指示または質問を入力してください...',
            'attachment': '参考画像',
            'attachmentTips': '注意：マルチモーダルモデルのみが画像解析をサポートしています',
            'systemPrompt': 'システムプロンプト（任意）',
            'systemPromptPlaceholder': 'AIの役割や行動規範を設定するために使用されます',
            'systemPromptTips': '例：あなたはシニアエンジニアです、簡潔に回答してください...',
            'modelName': 'モデル名（任意）',
            'modelPlaceholder': 'モデルIDを入力（デフォルトは自動一致）',
            'modelTips': '100文字以内を推奨します',
            'apiKeyPlaceholder': 'APIキーを入力してください (例: Bearer xxx)',
            // Error i18n
            'err_format': 'サーバーからの応答形式が無効です',
            'err_400': 'リクエストパラメータのエラーです',
            'err_401': '認証に失敗しました。APIキーを確認してください',
            'err_403': 'アクセス権限がありません',
            'err_500': 'サーバー内部エラーが発生しました',
            'err_unknown': '不明なサーバーエラーが発生しました',
            'err_service': 'サービスの実行中に例外が発生しました'
        },
    },

    // 定义错误信息集合 
    errorMessages: {
        'INVALID_FORMAT': t('err_format'),
        'ERROR_400': t('err_400'),
        'ERROR_401': t('err_401'),
        'ERROR_403': t('err_403'),
        'ERROR_500': t('err_500'),
        'ERROR_UNKNOWN': t('err_unknown'),
        'ERROR_SERVICE': t('err_service'),
    },

    formItems: [
        {
            key: 'message',
            label: t('prompt'),
            component: FormItemComponent.Textarea,
            props: {
                placeholder: t('promptPlaceholder'),
                enableFieldReference: true
            },
            validator: { required: true },
            tooltips: { title: t('prompt') }
        },
        {
            key: 'attachment',
            label: t('attachment'),
            component: FormItemComponent.FieldSelect,
            props: {
                mode: 'multiple',
                supportTypes: [FieldType.Attachment]
            },
            validator: { required: false },
            tooltips: { title: t('attachmentTips') }
        },
        {
            key: 'system_prompt',
            label: t('systemPrompt'),
            component: FormItemComponent.Textarea,
            props: {
                placeholder: t('systemPromptPlaceholder'),
                enableFieldReference: true
            },
            validator: { required: false },
            tooltips: { title: t('systemPromptTips') }
        },
        {
            key: 'model',
            label: t('modelName'),
            component: FormItemComponent.Textarea,
            props: {
                placeholder: t('modelPlaceholder')
            },
            validator: { required: false },
            tooltips: { title: t('modelTips') }
        }
    ],

    resultType: {
        type: FieldType.Text,
    },

    authorizations: {
        id: 'auth_id',
        platform: 'aimaxhug',
        type: AuthorizationType.MultiHeaderToken,
        params: [
            { key: "Authorization", placeholder: t('apiKeyPlaceholder') }
        ],
        required: true,
        instructionsUrl: "https://aimaxhug.com/",
        label: 'aimaxhug',
        tooltips: 'https://zhikemax.feishu.cn/wiki/L26mwubn8i5c65kYgSocKVNenpd',
        icon: {
            light: 'https://yinshan-1300111615.cos.ap-chengdu.myqcloud.com/aimaxhug/logo.png',
            dark: 'https://yinshan-1300111615.cos.ap-chengdu.myqcloud.com/aimaxhug/logo.png'
        }
    },

    execute: async (context, formData) => {
        const { model, system_prompt, message, attachment } = formData;
        const logID = context.extensionId || createUniqueId('DD_task');
        const startTime = Date.now();

        debugLog('===001 钉钉执行开始 ===', { formData, baseId: context.baseId, sheetId: context.sheetId }, logID);

        try {
            // const apiKey = getApiKeyFromConfig();
            const requestBody = buildRequestBody(formData, logID);

            const response = await context.fetch(
                AI_SERVICE_URL1,
                {
                    method: 'POST',
                    body: JSON.stringify(requestBody)
                }, 'auth_id');

            const requestEndTime = Date.now();
            debugLog({ '===004 HTTP请求完成': { status: response.status, ok: response.ok } }, undefined, logID);

            const result = await response.json();

            const statusVal = (typeof result.status === 'number') ? result.status
                : (typeof result.code === 'number' ? result.code : undefined);

            if (!result || typeof result !== 'object' || typeof statusVal !== 'number') {
                return {
                    code: FieldExecuteCode.Error,
                    errorMessage: 'INVALID_FORMAT' // 使用 errorMessages 中的 Key 
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
                    errorMessage: errKey // 映射到国际化 Key 
                };
            }

            const { aiContent } = extractResponseData(result);

            return {
                code: FieldExecuteCode.Success,
                data: aiContent
            };

        } catch (error: any) {
            debugLog('=== 执行异常 ===', { error: error.message }, logID);
            return {
                code: FieldExecuteCode.Error,
                errorMessage: 'ERROR_SERVICE' // 捕获异常也走国际化 
            };
        }
    },
});

/************ 工具调用 (保持不变)   *********************** */

const createUniqueId = (() => {
    return (prefix = 'dingding') => `${prefix}_${uuidv4()}`;
})();

function extractResponseData(result: any): { aiContent: string } {
    const aiContent = (result?.data?.output_result && typeof result.data.output_result === 'string')
        ? result.data.output_result
        : '无回复内容';
    return { aiContent };
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

function buildRequestBody(params: any, logID?: string): any {
    const { model, message, system_prompt, attachment } = params;
    const requestBody: any = {
        message: message?.trim() || ''
    };
    if (model?.trim()) requestBody.model = model.trim();
    if (system_prompt?.trim()) requestBody.system_prompt = system_prompt.trim();

    let processedAttachments: any[] = [];
    if (attachment) {
        const rawList = Array.isArray(attachment) ? (Array.isArray(attachment[0]) ? attachment.flat() : attachment) : [attachment];
        processedAttachments = rawList
            .filter(item => item?.tmp_url)
            .map(item => ({
                tmp_url: item.tmp_url,
                name: item.name || '',
                type: item.type === 'image' ? 'image/jpeg' : (item.type || ''),
                size: item.size || 0
            }));
    }
    if (processedAttachments.length > 0) requestBody.attachment = processedAttachments;
    return requestBody;
}

export default fieldDecoratorKit;