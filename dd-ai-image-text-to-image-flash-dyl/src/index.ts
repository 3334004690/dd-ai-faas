import { FieldType, fieldDecoratorKit, FormItemComponent, FieldExecuteCode,AuthorizationType } from 'dingtalk-docs-cool-app';
const { t } = fieldDecoratorKit;

// 通过addDomainList添加请求接口的域名
fieldDecoratorKit.setDomainList(['base-api.aimaxhug.com','yi-test.aimaxhug.com','stag-base-api.aimaxhug.com']);
// ==================== 1. 基础配置与工具模块 ====================
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';



const AI_SERVICE_URL = 'https://stag-base-api.aimaxhug.com/api/v1/imageToImage';// 测试环境
const AI_SERVICE_URL1 = 'https://base-api.aimaxhug.com/api/v1/imageToImage'; // 生产环境
const AI_SERVICE_URL2 = 'http://yi-test.aimaxhug.com:3200/api/v1/imageToImage'; // 本地环境
const REQUEST_HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Feishu-Field-Kit/1.0',
    'x-feishu-plugin': 'true'  //
};
fieldDecoratorKit.setDecorator({
  name: 'FaaS字段模板 - 汇率转换',
  // 定义捷径的i18n语言资源
  i18nMap: {
    'zh-CN': {
      'rmb': '人民币金额',
      'target': '目标币种',
      'USD': '美元',
      'EUR': '欧元',
    },
    'en-US': {
      'rmb': 'RMB Amount',
      'target': 'Target Currency',
      'USD': 'US Dollar',
      'EUR': 'Euro',
    },
    'ja-JP': {
      'rmb': '人民元の金額',
      'target': 'ターゲット通貨',
      'USD': '米ドル',
      'EUR': 'ユーロ',
    },
  },
  // 定义捷径的入参
  formItems: [

        {
            key: 'model',
            label: "AI模型",
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: 'nano_banana',
                  options: [
                      { key: 'nano_banana', title: 'Nano Banana Pro' },
                      { key: 'nano_banana_2', title: 'Nano Banana 2' },
                      { key: 'seed_dream', title: 'Seed Dream' },
                      { key: 'qwen_image', title: 'Qwen Image' }
                  ],
                placeholder: "请选择生成图片的AI模型",
            },
            validator: { required: true },
            tooltips: { title: '请选择生成图片的AI模型' }
        },

        {
            key: 'original_image',
            label: '原始图片',
            component: FormItemComponent.FieldSelect,
            props: {
                mode: 'multiple',
                supportTypes: [FieldType.Attachment] // 注意：属性名是 supportTypes (复数)
            },
            validator: { required: true },
            tooltips: { title: '请上传原始图片' }
        },

        {
            key: 'prompt',
            label: '提示词',
            component: FormItemComponent.Textarea, // 使用 Textarea 代替 Input
            props: {
                placeholder: '请输入你的提示词',
                enableFieldReference: true
            },
            validator: { required: true },
            tooltips: { title: '请输入你的提示词' } // 注意：钉钉 tooltips 是对象而非数组
        },


        {
            key: 'resolution',
            label: "分辨率",
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: '1k',
                options: [
                    { key: '1k', title: '1k' },
                    { key: '2k', title: '2k' },
                    { key: '4k', title: '4k' }
                ],
                placeholder: "选择生成图片的分辨率"
            },
            validator: { required: false },
            tooltips: { title: '选择生成图片的分辨率' }
        },


        {
            key: 'proportion',
            label: "比例",
            component: FormItemComponent.SingleSelect,
            props: {
                defaultValue: '1:1',
                options: [
                        { key: '1:1', title: '1:1' },
                      { key: '3:4 ', title: '3:4' },
                      { key: '9:16 ', title: '9:16' },
                      { key: '16:9 ', title: '16:9' },
                      { key: '4:3 ', title: '4:3' }
                ],
                placeholder: "选择生成图片的分辨率"
            },
            validator: { required: false },
            tooltips: { title: '选择生成图片的分辨率' }
        }
  ],
  // 定义捷径的返回结果类型
  resultType: {
    type: FieldType.Attachment,
  },

    authorizations: 
    {
      id: 'aimaxhug_auth',// 授权的id，用于context.fetch第三个参数指定使用
      platform: 'aimaxhug',// 授权平台，目前可以填写当前平台名称
      type: AuthorizationType.MultiHeaderToken, // 授权类型
      // 用户可以填写的key
      params: [
        { key: "Authorization", placeholder: "Bearer APIKey" }
      ],
      required: true,// 设置为选填，用户如果填了授权信息，请求中则会携带授权信息，否则不带授权信息
      instructionsUrl: "https://aimaxhug.com/",// 帮助链接，告诉使用者如何填写这个apikey
      label: 'aimaxhug', // 授权平台，告知用户填写哪个平台的信息
      tooltips: 'https://zhikemax.feishu.cn/wiki/L26mwubn8i5c65kYgSocKVNenpd', // 提示，引导用户添加授权
      // 当前平台的图标
      icon: {
        light: 'https://yinshan-1300111615.cos.ap-chengdu.myqcloud.com/aimaxhug/logo.png', 
        dark: 'https://yinshan-1300111615.cos.ap-chengdu.myqcloud.com/aimaxhug/logo.png'
      }
    },
  

  // formItemParams 为运行时传入的字段参数，对应字段配置里的 formItems （如引用的依赖字段）
  execute: async (context, formData) => {
    const { model, system_prompt,message,attachment } = formData;
     const logID = context.extensionId || createUniqueId('DD_task');
      const startTime = Date.now();

            debugLog('===001 钉钉执行开始 ===', { 
                formData,
                baseId: context.baseId, // 可以记录这些已存在的上下文信息
                sheetId: context.sheetId 
            }, logID);
           try {
            const apiKey = getApiKeyFromConfig();

            const requestBody = buildRequestBody(formData,logID);

             // 记录请求体构建完成

           const requestStartTime = Date.now();
   
               // 使用 context 提供的 fetch 方法
               const response = await context.fetch(
                AI_SERVICE_URL1, 
                {
                   method: 'POST',
                    headers: {
                    ...REQUEST_HEADERS,
                    'Authorization': `Bearer ${apiKey}`
                    },
                   body: JSON.stringify(requestBody)
               },'aimaxhug_auth');


               console.log(JSON.stringify(requestBody))

                           // 记录HTTP请求状态
            const requestEndTime = Date.now();
            const requestDuration = requestEndTime - requestStartTime;
            debugLog({
                '===004 HTTP请求完成': {
                    status: response.status,
                    ok: response.ok,
                    requestDuration: requestDuration + 'ms',
                    requestDurationSeconds: (requestDuration / 1000).toFixed(2) + 's'
                }
            }, undefined, logID);

            // ==================== 第四步：解析响应 ====================
            
            const result = await response.json();

            console.log(result)

            // 记录接收响应结果
            debugLog({
                '===006 接收响应结果': {
                    resultType: typeof result,
                    hasStatus: 'status' in result,
                    status: result?.status,
                    hasData: 'data' in result && !!result.data
                }
            }, undefined, logID);

            // ==================== 第五步：后端状态码检查 ====================

            // 后端返回格式: { code: 200, message: "ok", data: {...} } 或 { status: 200, data: {...} }
            const statusVal = (typeof result.status === 'number') ? result.status
                : (typeof result.code === 'number' ? result.code : undefined);
            if (!result || typeof result !== 'object' || typeof statusVal !== 'number') {
                debugLog({
                    '===007 响应格式错误': { 
                        resultType: typeof result
                    } 
                }, undefined, logID);
                return createErrorResponse('后端服务器返回了无效的响应格式');
            }


          
            // 检查后端业务状态码
            if (statusVal !== 200) {
                let errorMessage = result.message || `后端服务器业务处理异常(状态码:${statusVal})`;
                // 根据不同的状态码提供具体错误信息
                switch (statusVal) {
                    case 400:
                        errorMessage = `请求参数错误：${result.message || '请检查请求参数格式和必填字段'}`;
                        break;
                    case 401:
                        errorMessage = `认证失败：${result.message || '请检查API Key是否正确'}`;
                        break;
                    case 403:
                        errorMessage = `无权限：${result.message || '您没有权限访问此资源，请检查账号权限'}`;
                        break;
                    case 500:
                        errorMessage = `服务器内部错误：${result.message || '请联系技术支持'}`;
                        break;
                    default:
                        // 处理其他未预期的错误码
                        errorMessage = result.message || `服务器返回错误(状态码:${statusVal})，请联系技术支持`;
                        break;
                }

                debugLog({
                    '===008 后端服务器返回错误': {
                        code: statusVal,
                        message: result.message
                    }
                }, undefined, logID);

                return createErrorResponse(errorMessage);
            }


            // ==================== 第六步：提取响应数据 ====================

            const { imageUrl } = extractResponseData(result);
            console.log(imageUrl)
            // ==================== 第七步：返回成功结果 ====================

            // 检查是否成功获取到图片URL
            if (!imageUrl) {
                debugLog('===006 未获取到图片URL ===', { result }, logID);
                return createErrorResponse('未获取到生成的图片地址');
            }

            // 生成文件名（根据URL生成）
            let fileName = null;
            // 从URL中提取文件名，如果没有则使用默认名称
            const urlParts = imageUrl.split('/');
            const lastPart = urlParts[urlParts.length - 1];
            // 如果有文件名，提取；否则使用默认名称
            if (lastPart && lastPart.includes('.')) {
                fileName = lastPart.split('?')[0]; // 移除查询参数
            } else {
                // 根据输出格式确定文件扩展名
                const outputFormat = formData.outputFormat?.value || formData.outputFormat || 'mp3';
                fileName = `image-${Date.now()}.${outputFormat}`;
            }

            const response_img = await fetch(imageUrl, { method: 'HEAD' });
            const contentLength = response_img.headers.get('content-length');
            const size = contentLength ? parseInt(contentLength) : 0;
            debugLog('===007 返回响应数据 ===', {
                imageUrl: imageUrl,
                fileName: fileName
            }, logID);

            // const value = [{ fileName: fileName, tmp_url: imageUrl ,size:size, type: "image" }] as AttachmentFieldValue;

            return {
            code: FieldExecuteCode.Success,
            data: [{ fileName: fileName, url: imageUrl ,size:size, type: "image" }],
            };
   
           } catch (error: any) {
               debugLog('=== 执行异常 ===', { error: error.message }, logID);
               return {
                   code: FieldExecuteCode.Error,
                   data: `❌ 服务异常: ${error.message}`
               };
           }
  },
});



/************    工具调用   *********************** */

/**
 * 生成唯一 任务ID
 */
const createUniqueId = (() => {
  let lastTimestamp = 0;
  let counter = 0;
  
  return (prefix = 'dingding') => {
    return `${prefix}_${uuidv4()}`;
  };
})();


/**
 * 3.5 安全提取后端响应数据
 * @param {Object} result - API响应结果
 * @returns {Object} 提取的数据对象 {imageUrl: string | null}
 */
function extractResponseData(result) {
    // 后端返回格式: { status: 200, data: { imageUrl: "xxxx" }, message: "ok" }
    // data 可能为 null

    let imageUrl = null;
    if (result && typeof result === 'object' && result.data && typeof result.data === 'object') {
        imageUrl = result.data.imageUrl || null;
    }

    return {
        imageUrl
    };
}


/**
 * 从 config.json 中获取 API Key
 */
function getApiKeyFromConfig(): string {
    try {
        const rootConfigPath = path.join(process.cwd(), 'config.json');
        if (!fs.existsSync(rootConfigPath)) throw new Error(`未找到配置: ${rootConfigPath}`);
        
        const config = JSON.parse(fs.readFileSync(rootConfigPath, 'utf8'));
        const apiKey = config?.authorizations?.aimaxhug_auth;
        
        if (!apiKey) throw new Error('config.json 中未找到 aimaxhug_auth');
        return apiKey;
    } catch (error: any) {
        throw new Error(`读取配置失败: ${error.message}`);
    }
}

/**
 * 3.4 创建错误响应
 * @param {string} errorMessage - 错误消息
 * @returns {Object} 标准化错误响应
 */
function createErrorResponse(errorMessage: string): { code: any; data: string } {
    return {
        code: FieldExecuteCode.Error,
        data: `❌ 错误：${errorMessage}`
    };
}
/**
 * 3.1 调试日志函数
 * @description 输出结构化调试日志，支持两种调用方式，兼容飞书沙箱环境
 * @param {string | object} stepOrData - 日志步骤描述或日志对象
 * @param {any} data - 日志数据（可选）
 * @param {string} logID - 日志ID，从context中获取（可选）
 */
function debugLog(stepOrData: string | object, data?: any, logID?: string) {
    // 格式化时间戳为易读格式：2025-10-18 10:02:14
    const now = new Date();

    // 手动补零函数（避免 padStart 兼容性问题）
    const pad = (num: number, size: number = 2): string => {
        let s = String(num);
        while (s.length < size) { s = '0' + s; }
        return s;
    };

    const timestamp = now.getFullYear() + '-' +
        pad(now.getMonth() + 1) + '-' +
        pad(now.getDate()) + ' ' +
        pad(now.getHours()) + ':' +
        pad(now.getMinutes()) + ':' +
        pad(now.getSeconds());

    let logData: any = {
        timestamp: timestamp
    };

    // 如果提供了 logID，添加到日志数据中
    if (logID) {
        logData.logID = logID;
    }

    // 如果第一个参数是对象，直接使用（兼容旧的调用方式）
    if (typeof stepOrData === 'object') {
        logData = {
            ...logData,
            ...stepOrData
        };
    } else {
        // 如果第一个参数是字符串，作为 step
        logData.step = stepOrData;
        if (data !== undefined) {
            logData.data = data;
        }
    }

}

type Attachment = {
  name: string; // 附件名字
  type: string; // 附件类型
  size: number; // 附件大小
  tmp_url: string; // 附件链接
}
type AttachmentFieldValue = Array<Attachment>;


/**
 * 3.3 构建API请求体
 * @param {Object} params - 用户输入参数
 * @param {string} logID - 日志ID，从context中获取（可选）
 * @returns {Object} 标准化的API请求体
 */
function buildRequestBody(params, logID?: string) {
    const { model, original_image, prompt, resolution, proportion } = params;

    const getSelectValue = (fieldValue) => {
        if (!fieldValue) return null;
        if (typeof fieldValue === 'string') return fieldValue;
        if (typeof fieldValue === 'object' && fieldValue.value) {
            return fieldValue.value;
        }
        if (Array.isArray(fieldValue) && fieldValue.length > 0) {
            const first = fieldValue[0];
            if (first && typeof first === 'object' && first.value) {
                return first.value;
            }
        }
        return null;
    };

    const processedAttachments: any[] = [];
    if (original_image) {
        const pushAttachment = (item) => {
            if (item && typeof item === 'object' && item.tmp_url) {
                processedAttachments.push({
                    tmp_url: item.tmp_url,
                    name: item.name || '',
                    type: item.type || '',
                    size: item.size || 0
                });
            }
        };

        if (Array.isArray(original_image) && original_image.length > 0) {
            const firstItem = original_image[0];
            if (Array.isArray(firstItem)) {
                for (const subArray of original_image) {
                    if (Array.isArray(subArray)) {
                        for (const item of subArray) {
                            pushAttachment(item);
                        }
                    }
                }
            } else {
                for (const item of original_image) {
                    pushAttachment(item);
                }
            }
        } else if (typeof original_image === 'object') {
            pushAttachment(original_image);
        }

        if (processedAttachments.length > 0) {
            const attachmentType = Array.isArray(original_image)
                ? (original_image.length > 0 && Array.isArray(original_image[0]) ? '二维数组' : '一维数组')
                : '单个对象';
            debugLog('===002 处理附件', {
                originalAttachmentType: attachmentType,
                processedCount: processedAttachments.length,
                attachments: processedAttachments.map((att) => ({
                    name: att.name,
                    type: att.type,
                    size: att.size,
                    urlPreview: att.tmp_url ? att.tmp_url.substring(0, 50) + '...' : ''
                }))
            }, logID);
        }
    }

    const requestBody: any = {};

    if (processedAttachments.length > 0) {
        requestBody.original_image = processedAttachments;
    }

    if (typeof prompt === 'string' && prompt.trim()) {
        requestBody.prompt = prompt.trim();
    } else {
        requestBody.prompt = '';
    }

    const resolutionValue = getSelectValue(resolution);
    if (resolutionValue) {
        requestBody.resolution = resolutionValue;
    }

    const proportionValue = getSelectValue(proportion);
    if (proportionValue) {
        requestBody.proportion = proportionValue;
    }

    const modelValue = getSelectValue(model);
    if (modelValue) {
        requestBody.model = modelValue;
    }

            // 将所有附件信息完整传递给后端（包括 tmp_url, name, type, size）
    if (processedAttachments.length > 0) {
        requestBody.original_image = processedAttachments.map(item => ({
            ...item,
            type: item.type === 'image' ? 'image/jpeg' : item.type
        }));
    }

    debugLog('===003 构建请求体', {
        originalParams: params,
        requestBody: requestBody
    }, logID);

    console.log(requestBody)

    return requestBody;
}




export default fieldDecoratorKit;
