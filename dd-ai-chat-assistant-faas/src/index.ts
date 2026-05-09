import { FieldType, fieldDecoratorKit, FormItemComponent, FieldExecuteCode, AuthorizationType } from 'dingtalk-docs-cool-app';
const { t } = fieldDecoratorKit;

// 通过addDomainList添加请求接口的域名
fieldDecoratorKit.setDomainList(['base-api.aimaxhug.com', 'jia-test.aimaxhug.com', 'stag-base-api.aimaxhug.com']);

// ==================== 1. 基础配置与工具模块 ====================
import { v4 as uuidv4 } from 'uuid';


// 定义全量通用的音视频后缀
const ALLOWED_VIDEO_EXT = ['mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'webm', 'm4v', 'mpg', 'mpeg', '3gp', 'rmvb', 'ts', 'vob'];
const ALLOWED_AUDIO_EXT = ['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg', 'wma', 'amr', 'ape', 'm4r'];
const ALL_ALLOWED_EXT = [...ALLOWED_VIDEO_EXT, ...ALLOWED_AUDIO_EXT];

const ENV_CONFIG = {
    PROD: 'https://base-api.aimaxhug.com/api/v1/chat',
    LOCAL: 'http://jia-test.aimaxhug.com:3200/api/v1/chat'
} as const;
const USE_ENV = 'PROD' as keyof typeof ENV_CONFIG;
const SERVICE_URL = ENV_CONFIG[USE_ENV];

fieldDecoratorKit.setDecorator({
    name: 'AI 生文多模型（AimaxHug）',
    // 定义捷径的i18n语言资源
    i18nMap: {
        'zh-CN': {
            'pluginName': 'AI 生文多模型（AimaxHug）',
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
            'err_service': '服务执行异常，请稍后重试',

            'sourceContent_label': '音视频文件',
            'sourceContentTooltip': '1.支持本地音视频文件或抖音、B站、小红书、快手、tiktok、YouTube等50+平台网站的视频链接 2.链接请选择分享，复制的视频链接，而非网站链接 3.选择此项会增加额外的计费',
            'contentSource_label': '音视频获取信息',
            'contentSource_placeholder': '选择信息排序同生成结果排序',
            'contentSource_tooltip': '1.此处选项优先级高于任务描述 2.若勾选信息内容，则依此输出；若无选项，则以任务描述内容输出',
            'contentSource_option_original': '原文提取',
            'contentSource_option_original_title': '原标题提取',
            'contentSource_option_ai_generated': '内容摘要',
            'contentSource_option_key_points': '关键点',
            'contentSource_option_title_suggestions': '标题改写',
            'enableWeb_label': '联网功能',
            'enableWeb_tooltip': '1.选择此项会增加额外的计费',
            'enableWeb_option_false': '关闭',
            'enableWeb_option_true': '开启'
        },
        'en-US': {
            'pluginName': 'AI Text Generation Multi-Model (AimaxHug)',
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
            'err_service': 'Service execution exception',

            'sourceContent_label': 'Audio/Video File',
            'sourceContentTooltip': '1. Supports local audio/video files or video links from 50+ platforms such as Douyin, Bilibili, Xiaohongshu, Kuaishou, TikTok, YouTube, etc. 2. For links, please select the share option and copy the video link, not the website link. 3. Selecting this option will incur additional charges.',
            'contentSource_label': 'Audio/Video Info Extraction',
            'contentSource_placeholder': 'Select info order (same as output order)',
            'contentSource_tooltip': '1. Options here take precedence over task description. 2. If info options are selected, output follows them; if none selected, output follows task description.',
            'contentSource_option_original': 'Original Text',
            'contentSource_option_original_title': 'Original Title',
            'contentSource_option_ai_generated': 'Summary',
            'contentSource_option_key_points': 'Key Points',
            'contentSource_option_title_suggestions': 'Title Rewrites',
            'enableWeb_label': 'Web Search',
            'enableWeb_tooltip': '1. Selecting this option will incur additional charges.',
            'enableWeb_option_false': 'Off',
            'enableWeb_option_true': 'On'
        },
        'ja-JP': {
            'pluginName': 'AIテキスト生成マルチモデル（AimaxHug）',
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
            'err_service': 'サービスの実行中に例外が発生しました',

            'sourceContent_label': '音声・動画ファイル',
            'sourceContentTooltip': '1. ローカルの音声・動画ファイル、またはDouyin、Bilibili、Xiaohongshu、Kuaishou、TikTok、YouTubeなど50以上のプラットフォームの動画リンクに対応 2. リンクは共有オプションを選択し、動画リンク（ウェブサイトリンクではない）をコピーしてください 3. このオプションを選択すると追加料金が発生します',
            'contentSource_label': '音声・動画情報取得',
            'contentSource_placeholder': '情報の並び順を選択（生成結果の並び順と同じ）',
            'contentSource_tooltip': '1. ここのオプションはタスクの説明よりも優先されます 2. 情報オプションが選択されている場合はその出力に従い、オプションが選択されていない場合はタスクの説明に従って出力されます',
            'contentSource_option_original': '原文抽出',
            'contentSource_option_original_title': '元タイトル抽出',
            'contentSource_option_ai_generated': 'コンテンツ要約',
            'contentSource_option_key_points': 'キーポイント',
            'contentSource_option_title_suggestions': 'タイトル書き換え',
            'enableWeb_label': 'ネットワーク機能',
            'enableWeb_tooltip': '1. このオプションを選択すると追加料金が発生します',
            'enableWeb_option_false': 'オフ',
            'enableWeb_option_true': 'オン'
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
            key: 'source_content',
            label: t('sourceContent_label'),
            component: FormItemComponent.FieldSelect,
            props: {
            supportTypes: [FieldType.Attachment, FieldType.Text, FieldType.Link]
            },
            validator: { required: false },
            tooltips: { title: t('sourceContentTooltip') },
        },
        {
            key: 'content_source',
            label: t('contentSource_label'),
            component: FormItemComponent.MultiSelect,
            props: {
            placeholder: t('contentSource_placeholder'),
            options: [
                { title: t('contentSource_option_original'), key: 'original' },
                { title: t('contentSource_option_original_title'), key: 'original_title' },
                { title: t('contentSource_option_ai_generated'), key: 'ai_generated' },
                { title: t('contentSource_option_key_points'), key: 'key_points' },
                { title: t('contentSource_option_title_suggestions'), key: 'title_suggestions' },
            ]
            },
            validator: { required: false },
            tooltips: { title: t('contentSource_tooltip') },
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
        },
        {
            key: 'enable_web',
            label: t('enableWeb_label'),
            component: FormItemComponent.Radio,
            props: {
            defaultValue: 'false',
            options: [
                { label: t('enableWeb_option_false'), value: "false" },
                { label: t('enableWeb_option_true'), value: "true" }
            ]
            },
            validator: { required: false },
            tooltips: { title: t('enableWeb_tooltip') },
        }
    ],

    resultType: {
        type: FieldType.Text,
    },

    authorizations: {
        id: 'auth_id',
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
        const { model, system_prompt, message, attachment } = formData;
        const logID = context.extensionId || createUniqueId('DD_task');
        const startTime = Date.now();

        debugLog('===001 钉钉执行开始 ===', { formData, baseId: context.baseId, sheetId: context.sheetId }, logID);

        try {
            // const apiKey = getApiKeyFromConfig();
            const requestBody = buildRequestBody(formData, logID);

            console.log(requestBody)

            const response = await context.fetch(
                SERVICE_URL,
                {
                    method: 'POST',
                    headers:{'Content-Type': 'application/json'},
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
    const { model, message, system_prompt, attachment,enable_web,content_source,source_content } = params;
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



    if (source_content) {
            // 逻辑 A: 处理附件数组
        if (Array.isArray(source_content)) {
            const items = source_content.flat().filter(item => item);
            
            // 优先检查：是否为附件文件 (含有 tmp_url)
            const attachmentFiles = items.filter(item => item.tmp_url);
            
            if (attachmentFiles.length > 0) {
                // 后缀校验
                const invalidFiles = attachmentFiles.filter(f => {
                    const ext = f.name?.split('.').pop()?.toLowerCase();
                    return !ALL_ALLOWED_EXT.includes(ext);
                });


                requestBody.input_type = 'file';
                requestBody.files = attachmentFiles.map(f => ({
                    tmp_url: f.tmp_url,
                    name: f.name,
                    size: f.size,
                    type: f.type
                }));
            } 
            // 其次检查：结构化文本/链接对象 (type: 'url' 或 type: 'text')
            else {
                const firstUrlItem = items.find(i => i.type === 'url');
                const textContent = items.filter(i => i.type === 'text').map(i => i.text).join('\n').trim();

                if (firstUrlItem) {
                    requestBody.input_type = 'url';
                    requestBody.url_content = firstUrlItem.link || firstUrlItem.text;
                } else if (textContent) {
                    requestBody.input_type = 'url';
                    requestBody.url_content = textContent;
                }
            }
        }
        // 逻辑 B: 处理文本或链接
        else if (typeof source_content === 'string' && source_content.trim() !== '') {
            requestBody.input_type = 'url'; // 对应 DTO 的 IsIn(['file', 'url'])
            requestBody.url_content = source_content; // 对应 DTO 的 url_content 字段
        }
        // 逻辑 C: 处理单个附件对象
        else if (typeof source_content === 'object' && source_content.tmp_url) {
            const ext = source_content.name?.split('.').pop()?.toLowerCase();

            requestBody.input_type = 'file';
            requestBody.files = [{
                tmp_url: source_content.tmp_url,
                name: source_content.name,
                size: source_content.size,
                type: source_content.type
            }];
        }
    }


    if (enable_web === 'true'){  // 联网功能模型
        requestBody.enable_web = true;
    }else{
        requestBody.enable_web = false;
    }

    if (content_source) { // 逻辑：处理内容源
        requestBody.content_source = content_source.map(item => item).join(',');
    }

    // console.log(requestBody)

    return requestBody;
}

export default fieldDecoratorKit;