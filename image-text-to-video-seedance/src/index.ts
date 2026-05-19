// AI 视频/图片生成插件 - 飞书字段捷径版
// ==================== 1. 模块引入区域 ====================

const {
    basekit,
    FieldComponent,
    FieldType,
    FieldCode,
    AuthorizationType,
    field
} = require('@lark-opdev/block-basekit-server-api');
// 1.2 获取国际化翻译函数
const fs = require('fs');
const path = require('path');
const { t } = field;
// 1.1 白名单配置
basekit.addDomainList([
    'base-api.aimaxhug.com',
    'stag-base-api.aimaxhug.com',
    'jia-test.aimaxhug.com'
]);

// ==================== 2. 常量配置区域 ====================

// 环境地址：根据需要切换 ACTIVE_URL
const ENV_CONFIG = {
    PROD: 'https://base-api.aimaxhug.com/api/v2/video-tencentcloud/seedance',
    LOCAL: 'http://jia-test.aimaxhug.com:3200/api/v2/video-tencentcloud/seedance'
};

// 切换环境：'PROD' 或 'LOCAL'
const USE_ENV = 'PROD' as keyof typeof ENV_CONFIG;
const SERVICE_URL = ENV_CONFIG[USE_ENV];

const REQUEST_HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Feishu-Field-Kit/1.0',
};

// ==================== 3. 工具函数区域 ====================

/**
 * 3.1 结构化调试日志
 */
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

/**
 * 3.2 构建请求头
 */
/**
 * 2.1 从 config.json 中安全获取本地 API Key
 */
function getLocalApiKey() {
    try {
        const configPath = path.join(process.cwd(), 'config.json');        
        if (!fs.existsSync(configPath)) throw new Error(`Missing: ${configPath}`);
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return config.authorizations?.aimaxhug_auth;
    } catch (e) {
        return null;
    }
}

/**
 * 3.3 处理附件数组
 */
function processAttachments(fieldValue) {
    if (!fieldValue) return [];
    
    // 飞书附件字段返回通常是数组
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

/**
 * 3.4 提取下拉框值
 */
function getSelectValue(fieldValue) {
    if (!fieldValue) return null;
    if (typeof fieldValue === 'object') {
        return fieldValue.value || fieldValue.label || null;
    }
    return fieldValue;
}

/**
 * 3.5 提取 Radio/Switch 布尔值
 * 飞书 Radio 组件返回 { value: true/false } 或直接 true/false
 */
function getBoolValue(fieldValue, defaultVal: boolean = false): boolean {
    if (fieldValue === null || fieldValue === undefined) return defaultVal;
    if (typeof fieldValue === 'boolean') return fieldValue;
    if (typeof fieldValue === 'object') {
        const v = fieldValue.value;
        if (v === true || v === 'true' || v === 1) return true;
        if (v === false || v === 'false' || v === 0) return false;
    }
    return defaultVal;
}

/**
 * 3.6 构建后端 API 请求体
 * 完整透传 Seedance 2.0 所有支持参数
 */
function buildRequestBody(params, logID?: string) {
    const body: any = {
        // ── 基础参数 ──────────────────────────────────────────────
        prompt: (params.prompt || '').trim(),
        images: processAttachments(params.images),
        duration: getSelectValue(params.duration) || '5',
        aspect_ratio: getSelectValue(params.aspect_ratio) || '16:9',
        resolution: getSelectValue(params.resolution) || '720p',
        model: getSelectValue(params.model) || 'doubao-seedance-2-0-260128',

        // ── Seedance 2.0 功能开关 ─────────────────────────────────

        // 是否联合生成原生音频（对话/音效/背景音乐，支持 8 种以上语言唇形同步）
        generate_audio: getBoolValue(params.generate_audio, false),

        // 是否固定镜头（不做推拉摇移等镜头运动）
        camera_fixed: getBoolValue(params.camera_fixed, false),

        // 是否返回最后一帧图像 URL（用于接龙续生成拼接长视频）
        return_last_frame: getBoolValue(params.return_last_frame, false),

        // ── 可复现性参数 ──────────────────────────────────────────
        // 随机种子：相同 seed + 相同参数可尽量复现相同结果；空则随机
        seed: params.seed ? parseInt(params.seed, 42) : undefined,
    };

    // seed 为空时不传该字段，避免后端校验报错
    if (body.seed === undefined || isNaN(body.seed)) {
        delete body.seed;
    }

    debugLog('构建请求体完成', { body }, logID);
    return body;
}

// ==================== 4. 飞书插件配置区域 ====================

basekit.addField({


    authorizations: [
        {
            id: 'aimaxhug_auth',
            platform: 'aimaxhug',
            type: AuthorizationType.HeaderBearerToken,
            required: true,
            instructionsUrl: 'https://aimaxhug.com/',
            label: t('auth_label'),
            tooltips: [{
                type: 'link',
                text: t('auth_how_to_get_key'),
                link: 'https://zhikemax.feishu.cn/wiki/L26mwubn8i5c65kYgSocKVNenpd',
            }], 
            icon: {
                light: 'https://yinshan-1300111615.cos.ap-chengdu.myqcloud.com/aimaxhug/logo.png',
                dark: 'https://yinshan-1300111615.cos.ap-chengdu.myqcloud.com/aimaxhug/logo.png'
            }
        }
    ],

    options: { disableAutoUpdate: false },

    i18n: {
        messages: {
            /**
             * 4.4.1 中文语言包 (zh-CN)
             */
            'zh-CN': {
                // 授权字段
                'auth_label': 'AimaxHug API密钥 - 请输入sk-开头的API密钥',
                'auth_how_to_get_key': '如何获取 API 密钥',

                // 表单字段标签
                'task_description': '任务描述',
                'model_name': '模型名称（可填）',
                
                // 表单字段占位符
                'task_placeholder': '请输入你希望AI完成的任务',
                'model_placeholder': '可在此填入指定的模型名称（默认自动匹配）',
                
                // 表单字段提示信息
                'task_tooltip': '请输入您希望AI完成的任务描',
                'model_tooltip': '登录aimaxhug.com 查看支持的模型名称，最大输入限制100以内字符数',
                'system_prompt_label': '系统提示词',
                'system_prompt_placeholder': '用于设定角色和行为规范',
                'system_prompt_tooltip': '可设定"角色"或"说话风格"',
                
                // 附件字段
                'attachment_label': '附件内容',
                'attachment_placeholder': '请选择图片或者附件',
                'attachment_tooltip': '1.只有多模态模型支持图片输入，其他类型附件不支持2.文件支持.doc/x xls/x .pdf .ppt/x .csv .bxt .log .json .md 格式',
                
                // 链接文本
                'model_list_link_text': '查看支持的模型列表'
            },
            /**
             * 4.4.2 英文语言包 (en-US)
             */
            'en-US': {
                // Authorization field
                'auth_label': 'AimaxHug API Key - Please enter an API key starting with sk-',
                'auth_how_to_get_key': 'How to Get API Key',

                // Form field labels
                'task_description': 'Task Description',
                'model_name': 'Model Name (Optional)',
                
                // Form field placeholders
                'task_placeholder': 'Please enter the task you want AI to complete',
                'model_placeholder': 'You can enter a specific model name here (auto-matched by default)',
                
                // Form field tooltips
                'task_tooltip': 'Please enter the task description you want AI to complete',
                'model_tooltip': 'Visit aimaxhug.com to view supported model names, maximum input limit within 100 characters',
                'system_prompt_label': 'System Prompt (Optional)',
                'system_prompt_placeholder': 'Used to set role and behavior specifications',
                'system_prompt_tooltip': 'Set "role" or "speaking style"',
                
                // Attachment field
                'attachment_label': 'Image Content',
                'attachment_placeholder': 'Select image content (multimodal models supported)',
                'attachment_tooltip': 'Note: Only multimodal models support image attachment input, other attachment types are not supported',
                
                // Link text
                'model_list_link_text': 'View Supported Model List'
            },
            /**
             * 4.4.3 日文语言包 (ja-JP)
             */
            'ja-JP': {
                // 認証フィールド
                'auth_label': 'AimaxHug APIキー - sk-で始まるAPIキーを入力してください',
                'auth_how_to_get_key': 'APIキーの取得方法',

                // フォームフィールドラベル
                'task_description': 'タスク説明',
                'model_name': 'モデル名（オプション）',
                
                // フォームフィールドプレースホルダー
                'task_placeholder': 'AIに完了させたいタスクを入力してください',
                'model_placeholder': 'ここに特定のモデル名を入力できます（デフォルトで自動マッチングされます）',
                
                // フォームフィールドツールチップ
                'task_tooltip': 'AIに完了させたいタスクの説明を入力してください',
                'model_tooltip': 'aimaxhug.comにアクセスしてサポートされているモデル名を確認、最大入力制限は100文字以内',
                'system_prompt_label': 'システムプロンプト（オプション）',
                'system_prompt_placeholder': '役割と行動仕様の設定に使用',
                'system_prompt_tooltip': '「役割」や「話し方のスタイル」を設定可能',
                
                // 添付ファイルフィールド
                'attachment_label': '画像コンテンツ',
                'attachment_placeholder': '画像コンテンツを選択（マルチモーダルモデル対応）',
                'attachment_tooltip': '注意:マルチモーダルモデルのみ画像添付入力に対応、その他の添付ファイルタイプはサポートされていません',
                
                // リンクテキスト
                'model_list_link_text': 'サポートされているモデルリストを表示'
            }
        }
    },

    // ==================== 4.1 用户输入表单 ====================
    formItems: [
        // ── 必填：提示词 ──────────────────────────────────────────
        {
            key: 'prompt',
            label: "提示词",
            component: FieldComponent.Input,
            props: { placeholder: "请描述画面内容，并控制在2000字符内", multiline: true },
            validator: { required: true }
        },

        // ── 参考素材 ──────────────────────────────────────────────
        {
            key: 'images',
            label: "参考素材",
            component: FieldComponent.FieldSelect,
            props: {
                supportType: [FieldType.Attachment],
                placeholder: "请上传参考图或视频或音频",
                mode: 'multiple'
            },
            tooltips: [
                { type: 'text', content: "1.不传=文生视频；传1张图=图生视频；传2张图=首尾帧控制(第1张为首帧,第2张为尾帧)；" },
                { type: 'text', content: "2.传视频=视频参考生成；" },
                { type: 'text', content: "3.图片最多9张(<30MB/张)；视频最多3段(每段2~15秒,<50MB/段)；音频最多3个(MP3,<15MB/个)" }
            ]
        },

        // ── 生成模型 ──────────────────────────────────────────────
        {
            key: 'model',
            label: "生成模型",
            component: FieldComponent.SingleSelect,
            props: {
                options: [
                    { label: 'Seedance 2.0 标准版（高质量，适合成片）', value: 'doubao-seedance-2-0-260128' },
                    { label: 'Seedance 2.0 快速版（速度快，适合原型迭代）', value: 'doubao-seedance-2-0-fast-260128' },
                ],
                placeholder: "默认 Seedance 2.0 标准版"
            }
        },

        // ── 视频时长 ──────────────────────────────────────────────
        {
            key: 'duration',
            label: "视频时长",
            component: FieldComponent.SingleSelect,
            props: {
                options: [
                    { label: '5秒', value: '5' },
                    { label: '10秒', value: '10' },
                    { label: '15秒', value: '15' },
                ],
                placeholder: "默认5秒"
            },
            tooltips: [
                { type: 'text', content: "需要超过15秒长的视频，建议开启【返回最后一帧】进行接龙生成，再自行拼接" }
            ]
        },

        // ── 画面比例 ──────────────────────────────────────────────
        {
            key: 'aspect_ratio',
            label: "画面比例",
            component: FieldComponent.SingleSelect,
            props: {
                options: [
                    { label: '16:9', value: '16:9' },
                    { label: '9:16', value: '9:16' },
                    { label: '1:1', value: '1:1' },
                    { label: '4:3', value: '4:3' },
                    { label: '3:4', value: '3:4' },
                    { label: '21:9', value: '21:9' },
                    { label: '自适应', value: 'adaptive' },
                ],
                placeholder: "默认16:9"
            },
            tooltips: [
                { type: 'text', content: "选择自适应时，模型会读取输入图片的宽高比，避免裁切或加黑边（图生视频时推荐）。" }
            ]
        },

        // ── 分辨率 ────────────────────────────────────────────────
        {
            key: 'resolution',
            label: "分辨率",
            component: FieldComponent.SingleSelect,
            props: {
                options: [
                    { label: '480p', value: '480p' },
                    { label: '720p', value: '720p' },
                    { label: '1080p', value: '1080p' },
                    { label: '2K', value: '2K' },
                ],
                placeholder: "默认720p"
            },
            tooltips: [
                { type: 'text', content: "分辨率越高，消耗 token 越多，成本越高。原型调试建议用 480p，节省约 70% 成本。" }
            ]
        },

        // ── 原生音频 ──────────────────────────────────────────────
        {
            key: 'generate_audio',
            label: "生成原生音频",
            component: FieldComponent.Radio,
            props: {
                options: [
                    { label: '关闭', value: false },
                    { label: '开启', value: true }
                ]
            },
            tooltips: [
                { type: 'text', content: "开启后模型会联合生成与画面同步的音频，支持对话、音效、环境音、背景音乐。" },
                { type: 'text', content: "支持 8 种以上语言的唇形同步（口型同步）。" }
            ]
        },

        // ── 固定镜头 ──────────────────────────────────────────────
        {
            key: 'camera_fixed',
            label: "固定镜头",
            component: FieldComponent.Radio,
            props: {
                options: [
                    { label: '关闭（允许镜头运动）', value: false },
                    { label: '开启（镜头不动）', value: true }
                ]
            },
            tooltips: [
                { type: 'text', content: "开启后镜头保持静止，不做推拉摇移（dolly / tracking / crane）等运动。适合产品展示、人物访谈等场景。" }
            ]
        },

        // ── 返回最后一帧（接龙续生成） ─────────────────────────────
        {
            key: 'return_last_frame',
            label: "返回最后一帧",
            component: FieldComponent.Radio,
            props: {
                options: [
                    { label: '关闭', value: false },
                    { label: '开启（用于接龙拼接长视频）', value: true }
                ]
            },
            tooltips: [
                { type: 'text', content: "开启后响应中会包含本段视频最后一帧的图片 URL，可作为下一段视频的首帧，实现接龙续生成以拼接长视频。" }
            ]
        },

        // ── 随机种子（可复现） ────────────────────────────────────
        // {
        //     key: 'seed',
        //     label: "随机种子（可选）",
        //     component: FieldComponent.Input,
        //     props: { placeholder: "输入整数，留空则随机生成" },
        //     tooltips: [
        //         { type: 'text', content: "相同 seed + 相同参数可尽量复现相同结果，便于微调提示词时做对比。 默认随机" }
        //     ]
        // },
    ],

    resultType: { type: FieldType.Attachment },

    // ==================== 4.2 核心执行逻辑（保持原样） ====================
    execute: async (formItemParams, context) => {
        const logID = context?.logID || 'req_' + Date.now();

        try {
            // 1. 请求准备
            const requestBody = buildRequestBody(formItemParams, logID);
            const fetchOptions: any = {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: { ...REQUEST_HEADERS }
            };

            let authId: string | undefined = undefined;

            // 环境差异逻辑处理
            if (USE_ENV === 'LOCAL') {
                const localKey = getLocalApiKey();
                if (!localKey) throw new Error("Local API key not found in config.json");
                fetchOptions.headers['Authorization'] = `Bearer ${localKey}`;
                debugLog('Mode_Local', { url: SERVICE_URL }, logID);
            } else {
                authId = 'aimaxhug_auth'; // 线上环境关联 ID，框架自动注入
                debugLog('Mode_Prod', { url: SERVICE_URL }, logID);
            }

            // 2. 发送请求
            const response = await context.fetch(SERVICE_URL, fetchOptions, authId);

            // 3. 错误状态码处理
            if (!response.ok) {
                let errorData;
                try { errorData = await response.json(); } catch(e) { errorData = {}; }
                
                const status = response.status;
                const msg = errorData.message || response.statusText || '未知错误';
                
                debugLog('HTTP请求失败', { status, msg }, logID);

                // 映射飞书标准错误码
                const codeMap = {
                    400: FieldCode.InvalidArgument,
                    401: FieldCode.AuthorizationError,
                    403: FieldCode.PayError,
                    429: FieldCode.RateLimit
                };

                return {
                    code: codeMap[status] || FieldCode.Error,
                    data: `[服务异常 ${status}]: ${msg}`
                };
            }

            const result = await response.json();
            const bizCode = result.code || result.status;

            // 4. 业务状态码处理
            if (bizCode !== 200) {
                debugLog('业务逻辑报错', result, logID);
                return {
                    code: FieldCode.Error,
                    data: `生成失败：${result.message || '后端处理异常'}`
                };
            }

            // 5. 提取结果
            const mediaUrl = result.data?.url || result.data?.videoUrl;
            if (!mediaUrl) {
                return { code: FieldCode.Error, data: '未获取到生成的媒体地址，请重试' };
            }

            // 6. 返回结果给飞书
            const ext = mediaUrl.split('.').pop()?.split('?')[0] || 'mp4';
            return {
                code: FieldCode.Success,
                data: [{
                    name: `AI_Gen_${Date.now()}.${ext}`,
                    content: mediaUrl,
                    contentType: "attachment/url"
                }]
            };

        } catch (error) {
            debugLog('系统级崩溃', { msg: error.message }, logID);
            return {
                code: FieldCode.Error,
                data: `插件运行出错: ${error.message}`
            };
        }
    },
});

module.exports = basekit;