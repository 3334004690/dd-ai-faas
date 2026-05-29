import { FieldType, fieldDecoratorKit, FormItemComponent, FieldExecuteCode, AuthorizationType } from 'dingtalk-docs-cool-app';
const { t } = fieldDecoratorKit;

fieldDecoratorKit.setDomainList(['base-api.aimaxhug.com', 'jia-test.aimaxhug.com', 'stag-base-api.aimaxhug.com']);

import { v4 as uuidv4 } from 'uuid';

// ==================== 环境配置 ====================

const ENV_CONFIG = {
    PROD: 'https://base-api.aimaxhug.com/api/v2/video-tencentcloud/seedance',
    LOCAL: 'http://jia-test.aimaxhug.com:3200/api/v2/video-tencentcloud/seedance'
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

    const list = Array.isArray(fieldValue)
        ? (Array.isArray(fieldValue[0]) ? fieldValue.flat() : fieldValue)
        : [fieldValue];

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
    return fieldValue.value || (Array.isArray(fieldValue) && fieldValue[0]?.value) || null;
}

function getBoolValue(fieldValue: any, defaultVal: boolean = false): boolean {
    if (fieldValue === null || fieldValue === undefined) return defaultVal;
    if (typeof fieldValue === 'boolean') return fieldValue;
    if (typeof fieldValue === 'string') return fieldValue === 'true';
    if (typeof fieldValue === 'object') {
        const v = fieldValue.value || fieldValue.key;
        if (v === true || v === 'true' || v === 1) return true;
        if (v === false || v === 'false' || v === 0) return false;
    }
    return defaultVal;
}

function buildRequestBody(params: any, logID?: string) {
    const body: any = {
        prompt: (params.prompt || '').trim(),
        images: processAttachments(params.images),
        duration: getSelectValue(params.duration) || '5',
        aspect_ratio: getSelectValue(params.aspect_ratio) || '16:9',
        resolution: getSelectValue(params.resolution) || '720p',
        model: getSelectValue(params.model) || 'doubao-seedance-2-0-260128',
        generate_audio: getBoolValue(params.generate_audio, false),
        camera_fixed: getBoolValue(params.camera_fixed, false),
        return_last_frame: getBoolValue(params.return_last_frame, false),
    };

    if (params.seed) {
        body.seed = parseInt(params.seed, 10);
    }

    debugLog('构建请求体完成', { body }, logID);
    return body;
}

// ==================== 钉钉插件配置 ====================

fieldDecoratorKit.setDecorator({
    name: 'AI 视频生成(Seedance) https://www.aimaxhug.com',

    i18nMap: {
        'zh-CN': {
            'pluginName': 'AI 视频生成（Seedance）',
            'promptLabel': '提示词',
            'promptPlaceholder': '请描述画面内容，并控制在2000字符内',
            'imageLabel': '参考素材',
            'imageTips': '1.不传=文生视频；传1张图=图生视频；传2张图=首尾帧控制(第1张为首帧,第2张为尾帧)；2.传视频=视频参考生成；3.图片最多9张(<30MB/张)；视频最多3段(每段2~15秒,<50MB/段)；音频最多3个(MP3,<15MB/个)',
            'modelLabel': '生成模型',
            'modelPlaceholder': '默认 Seedance 2.0 标准版',
            'durationLabel': '视频时长',
            'durationTips': '需要超过15秒长的视频，建议开启【返回最后一帧】进行接龙生成，再自行拼接',
            'aspectLabel': '画面比例',
            'aspectTips': '选择自适应时，模型会读取输入图片的宽高比，避免裁切或加黑边（图生视频时推荐）。',
            'resolutionLabel': '分辨率',
            'resolutionTips': '分辨率越高，消耗 token 越多，成本越高。原型调试建议用 480p，节省约 70% 成本。1080p:Seedance 2.0 fast 不支持',
            'audioLabel': '生成原生音频',
            'audioTips': '开启后模型会联合生成与画面同步的音频，支持对话、音效、环境音、背景音乐。支持 8 种以上语言的唇形同步（口型同步）。',
            'cameraLabel': '固定镜头',
            'cameraTips': '开启后镜头保持静止，不做推拉摇移（dolly / tracking / crane）等运动。适合产品展示、人物访谈等场景。',
            'lastFrameLabel': '返回最后一帧',
            'lastFrameTips': '开启后响应中会包含本段视频最后一帧的图片 URL，可作为下一段视频的首帧，实现接龙续生成以拼接长视频。',
            'on': '开启',
            'off': '关闭',
            'cameraOn': '开启（镜头不动）',
            'cameraOff': '关闭（允许镜头运动）',
            'lastFrameOn': '开启（用于接龙拼接长视频）',
            'defaultOption': '默认',
            'err_format': '后端服务器返回了无效的响应格式',
            'err_no_url': '未获取到生成的视频地址',
            'err_400': '请求参数错误，请检查输入内容',
            'err_401': '认证失败，请检查 API Key',
            'err_403': '无权限访问',
            'err_500': '服务器内部错误',
            'err_unknown': '服务器返回未知异常',
            'err_service': '服务执行异常，请稍后重试'
        },
        'en-US': {
            'pluginName': 'AI Video Generation (Seedance)',
            'promptLabel': 'Prompt',
            'promptPlaceholder': 'Describe the visual content, within 2000 characters',
            'imageLabel': 'Reference Material',
            'imageTips': '1. Empty = text-to-video; 1 image = image-to-video; 2 images = first/last frame control;2. Upload video = video reference generation;3. Max 9 images (<30MB each), max 3 videos (2-15s each, <50MB each), max 3 audio files (MP3, <15MB each)',
            'modelLabel': 'Model',
            'modelPlaceholder': 'Default: Seedance 2.0 Standard',
            'durationLabel': 'Duration',
            'durationTips': 'For videos longer than 15s, enable "Return Last Frame" for concatenation',
            'aspectLabel': 'Aspect Ratio',
            'aspectTips': 'Select "Adaptive" to read the input image aspect ratio and avoid cropping or letterboxing.',
            'resolutionLabel': 'Resolution',
            'resolutionTips': 'Higher resolution consumes more tokens and costs more. Use 480p for prototyping to save ~70% cost.',
            'audioLabel': 'Generate Audio',
            'audioTips': 'When enabled, the model generates synchronized audio with dialogue, sound effects, ambient sound, and background music. Supports lip sync for 8+ languages.',
            'cameraLabel': 'Fixed Camera',
            'cameraTips': 'Keeps the camera static without dolly/tracking/crane movements. Suitable for product showcases and interview scenes.',
            'lastFrameLabel': 'Return Last Frame',
            'lastFrameTips': 'Returns the last frame image URL for concatenating multiple segments into a long video.',
            'on': 'On',
            'off': 'Off',
            'cameraOn': 'On (Static Camera)',
            'cameraOff': 'Off (Allow Camera Movement)',
            'lastFrameOn': 'On (For Concatenation)',
            'defaultOption': 'Default',
            'err_format': 'Invalid response format from server',
            'err_no_url': 'Failed to get the generated video URL',
            'err_400': 'Request parameter error',
            'err_401': 'Authentication failed',
            'err_403': 'Access denied',
            'err_500': 'Internal server error',
            'err_unknown': 'Unknown server error',
            'err_service': 'Service execution exception'
        },
        'ja-JP': {
            'pluginName': 'AI動画生成（Seedance）',
            'promptLabel': 'プロンプト',
            'promptPlaceholder': '映像内容を説明してください（2000文字以内）',
            'imageLabel': '参照素材',
            'imageTips': '1. 空=テキスト→動画；1枚=画像→動画；2枚=先頭/最終フレーム制御2. 動画=動画参照生成3. 画像最大9枚、動画最大3本、音声最大3ファイル',
            'modelLabel': '生成モデル',
            'modelPlaceholder': 'デフォルト: Seedance 2.0 標準版',
            'durationLabel': '動画時間',
            'durationTips': '15秒以上の動画が必要な場合は、「最終フレームを返す」を有効にして連結生成することをお勧めします。',
            'aspectLabel': '画面比率',
            'aspectTips': '「アダプティブ」を選択すると、入力画像のアスペクト比を読み取り、トリミングや黒枠を回避します。',
            'resolutionLabel': '解像度',
            'resolutionTips': '解像度が高いほどトークン消費とコストが増加します。プロトタイプ調整には480pを推奨（約70%コスト削減）。',
            'audioLabel': 'ネイティブ音声生成',
            'audioTips': '有効にすると、映像と同期した音声（会話、効果音、環境音、BGM）を生成。8言語以上のリップシンクに対応。',
            'cameraLabel': 'カメラ固定',
            'cameraTips': 'カメラを静止させ、ドリー/トラッキング/クレーンなどの動きを無効にします。製品展示やインタビューシーンに最適。',
            'lastFrameLabel': '最終フレームを返す',
            'lastFrameTips': '動画の最終フレーム画像URLを返し、次の動画の先頭フレームとして使用して連結生成が可能。',
            'on': '有効',
            'off': '無効',
            'cameraOn': '有効（カメラ固定）',
            'cameraOff': '無効（カメラ移動許可）',
            'lastFrameOn': '有効（連結用）',
            'defaultOption': 'デフォルト',
            'err_format': 'サーバーからの応答形式が無効です',
            'err_no_url': '生成された動画URLを取得できませんでした',
            'err_400': 'リクエストパラメータのエラーです',
            'err_401': '認証に失敗しました',
            'err_403': 'アクセス権限がありません',
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
                defaultValue: 'doubao-seedance-2-0-260128',
                options: [
                    { key: 'doubao-seedance-2-0-260128', title: 'Seedance 2.0 标准版（高质量，适合成片）' },
                    { key: 'doubao-seedance-2-0-fast-260128', title: 'Seedance 2.0 快速版（速度快，适合原型迭代）' },
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
            validator: { required: false },
            tooltips: { title: t('durationTips') }
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
                    { key: '3:4', title: '3:4' },
                    { key: '21:9', title: '21:9' },
                    { key: 'adaptive', title: '自适应' },
                ],
                placeholder: '默认16:9'
            },
            validator: { required: false },
            tooltips: { title: t('aspectTips') }
        },
        {
            key: 'resolution',
            label: t('resolutionLabel'),
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: '720p',
                options: [
                    { key: '480p', title: '480p' },
                    { key: '720p', title: '720p' },
                    { key: '1080p', title: '1080p' }
                ],
                placeholder: '默认720p'
            },
            validator: { required: false },
            tooltips: { title: t('resolutionTips') }
        },
        // {
        //     key: 'generate_audio',
        //     label: t('audioLabel'),
        //     component: FormItemComponent.SingleSelect,
        //     props: {
        //         defaultValue: 'false',
        //         options: [
        //             { key: 'false', title: t('off') },
        //             { key: 'true', title: t('on') },
        //         ]
        //     },
        //     validator: { required: false },
        //     tooltips: { title: t('audioTips') }
        // },
        // {
        //     key: 'camera_fixed',
        //     label: t('cameraLabel'),
        //     component: FormItemComponent.SingleSelect,
        //     props: {
        //         defaultValue: 'false',
        //         options: [
        //             { key: 'false', title: t('cameraOff') },
        //             { key: 'true', title: t('cameraOn') },
        //         ]
        //     },
        //     validator: { required: false },
        //     tooltips: { title: t('cameraTips') }
        // },
        // {
        //     key: 'return_last_frame',
        //     label: t('lastFrameLabel'),
        //     component: FormItemComponent.SingleSelect,
        //     props: {
        //         defaultValue: 'false',
        //         options: [
        //             { key: 'false', title: t('off') },
        //             { key: 'true', title: t('lastFrameOn') },
        //         ]
        //     },
        //     validator: { required: false },
        //     tooltips: { title: t('lastFrameTips') }
        // },
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
        const logID = context.extensionId || `seedance_${uuidv4()}`;
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

            const result = await response.json();
            debugLog('=== 接收响应结果 ===', result, logID);

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

            const mediaUrl = result.data?.url || result.data?.videoUrl;
            if (!mediaUrl) {
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
            debugLog('=== 执行异常 ===', { error: error.message }, logID);
            return {
                code: FieldExecuteCode.Error,
                extra: { logID },
                errorMessage: 'ERROR_SERVICE'
            };
        }
    },
});

export default fieldDecoratorKit;
