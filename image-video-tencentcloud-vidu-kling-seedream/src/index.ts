import { FieldType, fieldDecoratorKit, FormItemComponent, FieldExecuteCode, AuthorizationType } from 'dingtalk-docs-cool-app';
import { v4 as uuidv4 } from 'uuid';

const { t } = fieldDecoratorKit;

// ==================== 1. 域名白名单配置 ====================
fieldDecoratorKit.setDomainList([
    'base-api.aimaxhug.com',
    'stag-base-api.aimaxhug.com',
    'jia-test.aimaxhug.com'
]);

// ==================== 2. 常量配置区域 ====================
const ENV_CONFIG = {
    PROD: 'https://base-api.aimaxhug.com/api/v2/video-tencentcloud/vidu-kling-seedance',
    LOCAL: 'http://jia-test.aimaxhug.com:3200/api/v2/video-tencentcloud/vidu-kling-seedance'
} as const;

const USE_ENV = 'PROD' as keyof typeof ENV_CONFIG;
const SERVICE_URL = ENV_CONFIG[USE_ENV];

// ==================== 3. 插件核心配置 ====================
fieldDecoratorKit.setDecorator({
    name: 'AI 视频生成多模型(Vidu/可灵) https://www.aimaxhug.com',

    // 3.1 国际化语言资源
    i18nMap: {
        'zh-CN': {
            'pluginName': 'AI 视频生成多模型（Vidu/可灵）',

            // 表单标签
            'promptLabel': '提示词',
            'imagesLabel': '参考素材',
            'modelLabel': '生成模型',
            'durationLabel': '视频时长',
            'aspectRatioLabel': '画面比例',
            'resolutionLabel': '分辨率',

            // 占位符
            'promptPlaceholder': '请描述画面细节与动作，字数请控制在 2000 字以内（兼容所有模型）',
            'imagesTips': '1.不传=文生视频；传图=图生视频；传视频=视频生视频。 2.vidu传入视频参考必须传入图片否则为文生视频。 3.图生视频最多传1-3张（Vidu需传2张作为首尾帧）；超出部分将由系统自动忽略。',
            'modelPlaceholder': '默认vidu',
            'modelTips': '请选择要调用的 AI 视频大模型',
            'durationPlaceholder': '默认5秒',
            'durationTips': '1.vidu传入视频参考不支持15秒时长、仅支持5-10秒时长。 2.kling传入视频参考不支持15秒时长、仅支持5-10秒时长。',
            'aspectRatioPlaceholder': '默认16:9',
            'aspectRatioTips': '若您选择了带括号的专属比例，但模型选了不支持的可灵，系统将自动降级为最接近的 16:9 或 9:16。',
            'resolutionPlaceholder': '默认720p',
            'resolutionTips': '仅可灵支持4k分辨率，并支持除 视频参考 外的全部功能',

            // 选项标签
            'opt_vidu': 'Vidu',
            'opt_kling': '可灵',
            'opt_5s': '5秒',
            'opt_10s': '10秒',
            'opt_15s': '15秒',
            'opt_169': '16:9（横屏）',
            'opt_916': '9:16（竖屏）',
            'opt_11': '1:1（方形）',
            'opt_720p': '720p',
            'opt_1080p': '1080p',
            'opt_4k': '4k（仅可灵支持）',

            // 错误提示
            'err_format': '后端服务器返回了无效的响应格式',
            'err_no_url': '未获取到生成的媒体地址，请重试',
            'err_400': '请求参数错误，请检查输入内容',
            'err_401': '认证失败，请检查 API Key',
            'err_403': '无权限访问',
            'err_500': '服务器内部错误',
            'err_unknown': '服务器返回未知异常',
            'err_service': '服务执行异常，请稍后重试'
        },
        'en-US': {
            'pluginName': 'AI Video Generation Multi-Model (Vidu/Kling)',

            'promptLabel': 'Prompt',
            'imagesLabel': 'Reference Material',
            'modelLabel': 'Generation Model',
            'durationLabel': 'Video Duration',
            'aspectRatioLabel': 'Aspect Ratio',
            'resolutionLabel': 'Resolution',

            'promptPlaceholder': 'Describe the scene details and actions, within 2000 characters',
            'imagesTips': '1. No input = text-to-video; image input = image-to-video; video input = video-to-video. 2. Vidu video reference requires an image, otherwise treated as text-to-video. 3. Max 1-3 images for image-to-video (Vidu needs 2 as start/end frames); extras are ignored.',
            'modelPlaceholder': 'Default: vidu',
            'modelTips': 'Select the AI video model to use',
            'durationPlaceholder': 'Default: 5s',
            'durationTips': '1. Vidu with video reference only supports 5-10s. 2. Kling with video reference only supports 5-10s.',
            'aspectRatioPlaceholder': 'Default: 16:9',
            'aspectRatioTips': 'If you select a ratio not supported by Kling, the system will auto-downgrade to the closest 16:9 or 9:16.',
            'resolutionPlaceholder': 'Default: 720p',
            'resolutionTips': 'Only Kling supports 4K resolution.',

            'opt_vidu': 'Vidu',
            'opt_kling': 'Kling',
            'opt_5s': '5 seconds',
            'opt_10s': '10 seconds',
            'opt_15s': '15 seconds',
            'opt_169': '16:9 (Landscape)',
            'opt_916': '9:16 (Portrait)',
            'opt_11': '1:1 (Square)',
            'opt_720p': '720p',
            'opt_1080p': '1080p',
            'opt_4k': '4K (Kling only)',

            'err_format': 'Invalid response format from server',
            'err_no_url': 'Failed to get the generated media URL, please retry',
            'err_400': 'Request parameter error, please check inputs',
            'err_401': 'Authentication failed, please check API Key',
            'err_403': 'Access denied',
            'err_500': 'Internal server error',
            'err_unknown': 'Unknown server error',
            'err_service': 'Service execution exception, please retry later'
        },
        'ja-JP': {
            'pluginName': 'AI動画生成マルチモデル（Vidu/Kling）',

            'promptLabel': 'プロンプト',
            'imagesLabel': '参照素材',
            'modelLabel': '生成モデル',
            'durationLabel': '動画の長さ',
            'aspectRatioLabel': 'アスペクト比',
            'resolutionLabel': '解像度',

            'promptPlaceholder': 'シーンの詳細とアクションを記述してください（2000文字以内）',
            'imagesTips': '1.未入力=テキストから動画；画像入力=画像から動画；動画入力=動画から動画。 2.Viduの動画参照には画像が必要です。 3.画像から動画は最大1-3枚（Viduは2枚必要）',
            'modelPlaceholder': 'デフォルト: vidu',
            'modelTips': '使用するAI動画モデルを選択してください',
            'durationPlaceholder': 'デフォルト: 5秒',
            'durationTips': '1.Viduの動画参照は5-10秒のみ対応。 2.Klingの動画参照は5-10秒のみ対応。',
            'aspectRatioPlaceholder': 'デフォルト: 16:9',
            'aspectRatioTips': 'Klingがサポートしない比率を選択した場合、最も近い16:9または9:16に自動ダウングレードされます。',
            'resolutionPlaceholder': 'デフォルト: 720p',
            'resolutionTips': '4K解像度はKlingのみサポートしています。',

            'opt_vidu': 'Vidu',
            'opt_kling': 'Kling',
            'opt_5s': '5秒',
            'opt_10s': '10秒',
            'opt_15s': '15秒',
            'opt_169': '16:9（横画面）',
            'opt_916': '9:16（縦画面）',
            'opt_11': '1:1（正方形）',
            'opt_720p': '720p',
            'opt_1080p': '1080p',
            'opt_4k': '4K（Klingのみ）',

            'err_format': 'サーバーからの応答形式が無効です',
            'err_no_url': '生成されたメディアURLを取得できませんでした',
            'err_400': 'リクエストパラメータのエラーです',
            'err_401': '認証に失敗しました',
            'err_403': 'アクセス権限がありません',
            'err_500': 'サーバー内部エラーが発生しました',
            'err_unknown': '不明なサーバーエラー',
            'err_service': 'サービスの実行中に例外が発生しました'
        }
    },

    // 3.2 错误信息映射
    errorMessages: {
        'INVALID_FORMAT': t('err_format'),
        'NO_MEDIA_URL':   t('err_no_url'),
        'ERROR_400':      t('err_400'),
        'ERROR_401':      t('err_401'),
        'ERROR_403':      t('err_403'),
        'ERROR_500':      t('err_500'),
        'ERROR_UNKNOWN':  t('err_unknown'),
        'ERROR_SERVICE':  t('err_service'),
    },

    // 3.3 表单项配置
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
            label: t('imagesLabel'),
            component: FormItemComponent.FieldSelect,
            props: {
                mode: 'multiple',
                supportTypes: [FieldType.Attachment]
            },
            validator: { required: false },
            tooltips: { title: t('imagesTips') }
        },
        {
            key: 'model',
            label: t('modelLabel'),
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: 'vidu',
                options: [
                    { key: 'vidu',  title: t('opt_vidu') },
                    { key: 'kling', title: t('opt_kling') }
                ],
                placeholder: t('modelPlaceholder')
            },
            validator: { required: false },
            tooltips: { title: t('modelTips') }
        },
        {
            key: 'duration',
            label: t('durationLabel'),
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: '5',
                options: [
                    { key: '5',  title: t('opt_5s') },
                    { key: '10', title: t('opt_10s') },
                    { key: '15', title: t('opt_15s') }
                ],
                placeholder: t('durationPlaceholder')
            },
            validator: { required: false },
            tooltips: { title: t('durationTips') }
        },
        {
            key: 'aspect_ratio',
            label: t('aspectRatioLabel'),
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: '16:9',
                options: [
                    { key: '16:9', title: t('opt_169') },
                    { key: '9:16', title: t('opt_916') },
                    { key: '1:1',  title: t('opt_11') }
                ],
                placeholder: t('aspectRatioPlaceholder')
            },
            validator: { required: false },
            tooltips: { title: t('aspectRatioTips') }
        },
        {
            key: 'resolution',
            label: t('resolutionLabel'),
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: '720p',
                options: [
                    { key: '720p',  title: t('opt_720p') },
                    { key: '1080p', title: t('opt_1080p') },
                    { key: '4k',    title: t('opt_4k') }
                ],
                placeholder: t('resolutionPlaceholder')
            },
            validator: { required: false },
            tooltips: { title: t('resolutionTips') }
        }
    ],

    // 3.4 返回类型：附件（视频）
    resultType: {
        type: FieldType.Attachment
    },

    // 3.5 授权配置
    authorizations: {
        id: 'aimaxhug_auth',
        platform: 'aimaxhug',
        type: AuthorizationType.HeaderBearerToken,
        required: true,
        instructionsUrl: 'https://aimaxhug.com/',
        label: 'aimaxhug',
        tooltips: 'https://alidocs.dingtalk.com/i/nodes/NkDwLng8ZLy5rXjYfa7y9R15VKMEvZBY',
        icon: {
            light: 'https://yinshan-1300111615.cos.ap-chengdu.myqcloud.com/aimaxhug/logo.png',
            dark:  'https://yinshan-1300111615.cos.ap-chengdu.myqcloud.com/aimaxhug/logo.png'
        }
    },

    // ==================== 4. 核心执行逻辑 ====================
    execute: async (context, formData) => {
        const logID = context.extensionId || createUniqueId('DD_video_task');
        debugLog('===001 钉钉视频生成执行开始 ===', { formData, baseId: context.baseId, sheetId: context.sheetId }, logID);

        try {
            // Step 1: 构建请求体
            const requestBody = buildRequestBody(formData, logID);
            debugLog('===002 请求体构建完成 ===', requestBody, logID);

            // Step 2: 发送请求
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
            debugLog('===003 接收响应结果 ===', result, logID);

            // Step 3: 校验响应格式
            const statusVal = (typeof result.status === 'number') ? result.status
                : (typeof result.code === 'number' ? result.code : undefined);

            if (!result || typeof result !== 'object' || typeof statusVal !== 'number') {
                return { code: FieldExecuteCode.Error, errorMessage: 'INVALID_FORMAT' };
            }

            // Step 4: 处理业务状态码
            if (statusVal !== 200) {
                let errKey = 'ERROR_UNKNOWN';
                switch (statusVal) {
                    case 400: errKey = 'ERROR_400'; break;
                    case 401: errKey = 'ERROR_401'; break;
                    case 403: errKey = 'ERROR_403'; break;
                    case 500: errKey = 'ERROR_500'; break;
                }
                debugLog('===004 业务逻辑报错 ===', { statusVal, errKey }, logID);
                return { code: FieldExecuteCode.Error, errorMessage: errKey };
            }

            // Step 5: 提取媒体地址
            const mediaUrl = result.data?.url || result.data?.videoUrl;
            if (!mediaUrl) {
                return { code: FieldExecuteCode.Error, errorMessage: 'NO_MEDIA_URL' };
            }

            // Step 6: 组装文件名并返回
            const ext = mediaUrl.split('.').pop()?.split('?')[0] || 'mp4';
            const fileName = `AI_Gen_${Date.now()}.${ext}`;
            debugLog('===005 执行成功 ===', { fileName, mediaUrl }, logID);

            return {
                code: FieldExecuteCode.Success,
                data: [{ fileName, url: mediaUrl, size: 8362, type: 'image' }]
            };

        } catch (error: any) {
            debugLog('=== 执行异常 ===', { error: error.message }, logID);
            return {
                code: FieldExecuteCode.Error,
                extra: { logID },
                errorMessage: 'ERROR_SERVICE'
            };
        }
    }
});

// ==================== 5. 工具方法 ====================

/** 生成唯一 ID */
const createUniqueId = (() => {
    return (prefix = 'dingding') => `${prefix}_${uuidv4()}`;
})();

/** 结构化调试日志 */
function debugLog(stepOrData: string | object, data?: any, logID?: string) {
    const now = new Date();
    const pad = (n: number): string => String(n).padStart(2, '0');
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

/** 提取下拉框值（兼容字符串/对象两种格式） */
function getSelectValue(fieldValue: any): string | null {
    if (!fieldValue) return null;
    if (typeof fieldValue === 'string') return fieldValue;
    return fieldValue.value || (Array.isArray(fieldValue) && fieldValue[0]?.value) || null;
}

/** 处理附件字段，展开多层数组并过滤有效项 */
function processAttachments(fieldValue: any): any[] {
    if (!fieldValue) return [];
    const items = Array.isArray(fieldValue)
        ? (Array.isArray(fieldValue[0]) ? fieldValue.flat() : fieldValue)
        : [fieldValue];

    return items
        .filter((item: any) => item?.tmp_url)
        .map((item: any) => ({
            tmp_url: item.tmp_url,
            name:    item.name  || '',
            type: item.type === 'image' ? 'image/jpeg' : (item.type || ''),
            size:    item.size  || 0
        }));
}

/** 构建后端请求体 */
function buildRequestBody(params: any, logID?: string) {
    const { prompt, images, model, duration, aspect_ratio, resolution } = params;

    const body: any = {
        prompt:       (typeof prompt === 'string' ? prompt.trim() : ''),
        images:       processAttachments(images),
        model:        getSelectValue(model)        || 'vidu',
        duration:     getSelectValue(duration)     || '5',
        aspect_ratio: getSelectValue(aspect_ratio) || '16:9',
        resolution:   getSelectValue(resolution)   || '720p'
    };

    // 去掉空数组，避免无效传参
    if (body.images.length === 0) delete body.images;

    debugLog('构建请求体完成', body, logID);
    return body;
}

export default fieldDecoratorKit;